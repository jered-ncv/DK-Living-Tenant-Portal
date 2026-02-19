-- ============================================================
-- DK Living Tenant Portal — Lease Tracking & Renewal Automation
-- Supabase Migration
-- Run in: Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- ============================================================
-- TABLE 1: leases
-- Every lease gets its own row. Unit 8 → Unit 9 transfer = 
-- Unit 8 lease ends + Unit 9 lease starts. Full history.
-- ============================================================

CREATE TABLE IF NOT EXISTS leases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Tenant info (denormalized for rent roll queries without joins)
  tenant_name TEXT NOT NULL,
  tenant_email TEXT,
  tenant_phone TEXT,

  -- Lease terms
  lease_start DATE NOT NULL,
  lease_end DATE,                          -- NULL = month-to-month / at-will
  monthly_rent NUMERIC(10,2) NOT NULL,
  security_deposit NUMERIC(10,2) DEFAULT 0,
  lease_type TEXT NOT NULL DEFAULT 'fixed'  -- fixed, month_to_month, at_will
    CHECK (lease_type IN ('fixed', 'month_to_month', 'at_will')),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'renewed', 'expired', 'terminated', 'transferred')),
  
  -- Renewal tracking
  renewal_status TEXT DEFAULT 'pending'
    CHECK (renewal_status IN ('pending', 'offer_sent', 'accepted', 'declined', 'not_renewing', 'transferred')),
  renewal_offer_rent NUMERIC(10,2),        -- proposed rent for renewal
  renewal_offer_sent_at TIMESTAMPTZ,
  renewal_response_at TIMESTAMPTZ,
  renewal_notes TEXT,

  -- Transfer tracking (e.g., Libby Unit 8 → Unit 9)
  transferred_from_lease_id UUID REFERENCES leases(id),
  transferred_to_lease_id UUID REFERENCES leases(id),

  -- Move-in/out
  move_in_date DATE,
  move_out_date DATE,
  notice_given_at TIMESTAMPTZ,
  notice_type TEXT                          -- tenant_notice, non_renewal, mutual, eviction
    CHECK (notice_type IN ('tenant_notice', 'non_renewal', 'mutual', 'eviction')),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- Indexes for common queries
CREATE INDEX idx_leases_unit_id ON leases(unit_id);
CREATE INDEX idx_leases_tenant_id ON leases(tenant_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_leases_lease_end ON leases(lease_end);
CREATE INDEX idx_leases_renewal_status ON leases(renewal_status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_leases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leases_updated_at
  BEFORE UPDATE ON leases
  FOR EACH ROW
  EXECUTE FUNCTION update_leases_updated_at();


-- ============================================================
-- TABLE 2: lease_actions
-- Every event in the lease lifecycle gets logged here.
-- Renewal offers, notices, rent changes, transfers, notes.
-- ============================================================

CREATE TABLE IF NOT EXISTS lease_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL
    CHECK (action_type IN (
      'lease_created',
      'renewal_review',         -- 90-day internal review
      'renewal_offer_sent',     -- 60-day offer email
      'renewal_accepted',
      'renewal_declined',
      'rent_increase',
      'notice_received',        -- tenant gave notice
      'non_renewal_sent',       -- we sent non-renewal
      'transfer_out',           -- tenant moving to different unit
      'transfer_in',            -- tenant arrived from different unit
      'lease_signed',
      'move_in',
      'move_out',
      'lease_terminated',
      'note'                    -- general note / comment
    )),
  
  -- Details
  description TEXT,              -- human-readable description
  old_rent NUMERIC(10,2),        -- for rent changes
  new_rent NUMERIC(10,2),        -- for rent changes
  related_lease_id UUID REFERENCES leases(id),  -- for transfers
  
  -- Who did it
  performed_by UUID REFERENCES profiles(id),
  performed_by_name TEXT,        -- denormalized for quick display
  
  -- Audit
  performed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lease_actions_lease_id ON lease_actions(lease_id);
CREATE INDEX idx_lease_actions_type ON lease_actions(action_type);
CREATE INDEX idx_lease_actions_performed_at ON lease_actions(performed_at);


-- ============================================================
-- VIEW: renewal_alerts
-- Powers the PM dashboard. Shows every active lease with
-- days remaining and which renewal stage it should be in.
-- ============================================================

CREATE OR REPLACE VIEW renewal_alerts AS
SELECT
  l.id AS lease_id,
  l.tenant_name,
  l.tenant_email,
  l.monthly_rent,
  l.lease_start,
  l.lease_end,
  l.lease_type,
  l.status,
  l.renewal_status,
  l.renewal_offer_rent,
  l.renewal_offer_sent_at,
  u.id AS unit_id,
  p.address AS property_address,
  u.unit_number,

  -- Days remaining
  CASE 
    WHEN l.lease_end IS NOT NULL 
    THEN (l.lease_end - CURRENT_DATE)
    ELSE NULL
  END AS days_remaining,

  -- Renewal stage based on days remaining
  CASE
    WHEN l.lease_end IS NULL THEN 'at_will'
    WHEN l.renewal_status IN ('accepted', 'declined', 'not_renewing', 'transferred') THEN l.renewal_status
    WHEN (l.lease_end - CURRENT_DATE) <= 30 THEN 'critical'      -- inside 30 days, no decision yet
    WHEN (l.lease_end - CURRENT_DATE) <= 60 THEN 'offer_due'     -- 60-day window, send offer
    WHEN (l.lease_end - CURRENT_DATE) <= 90 THEN 'review_due'    -- 90-day window, internal review
    ELSE 'no_action'
  END AS renewal_stage,

  -- Priority sorting
  CASE
    WHEN l.lease_end IS NULL THEN 999
    ELSE (l.lease_end - CURRENT_DATE)
  END AS sort_priority

FROM leases l
JOIN units u ON l.unit_id = u.id
JOIN properties p ON u.property_id = p.id
WHERE l.status = 'active'
ORDER BY sort_priority ASC;


-- ============================================================
-- VIEW: lease_history
-- Full timeline for any unit — every lease that's existed.
-- ============================================================

CREATE OR REPLACE VIEW lease_history AS
SELECT
  l.*,
  u.unit_number,
  p.address AS property_address,
  (
    SELECT json_agg(
      json_build_object(
        'action_type', la.action_type,
        'description', la.description,
        'performed_at', la.performed_at,
        'performed_by_name', la.performed_by_name,
        'old_rent', la.old_rent,
        'new_rent', la.new_rent
      ) ORDER BY la.performed_at ASC
    )
    FROM lease_actions la
    WHERE la.lease_id = l.id
  ) AS action_log
FROM leases l
JOIN units u ON l.unit_id = u.id
JOIN properties p ON u.property_id = p.id
ORDER BY l.lease_start DESC;


-- ============================================================
-- VIEW: rent_roll_view
-- Replaces the Buildium rent roll. Active leases with 
-- balances (once Stripe/QBO integration is live).
-- ============================================================

CREATE OR REPLACE VIEW rent_roll_view AS
SELECT
  p.address AS property_address,
  u.unit_number,
  u.bed_count,
  u.bath_count,
  l.tenant_name,
  l.lease_start,
  l.lease_end,
  l.monthly_rent,
  l.security_deposit,
  l.lease_type,
  l.status,
  l.renewal_status,
  CASE 
    WHEN l.lease_end IS NOT NULL 
    THEN (l.lease_end - CURRENT_DATE)
    ELSE NULL
  END AS days_remaining,
  -- Placeholder for payment data once Stripe/QBO syncs
  0.00::NUMERIC(10,2) AS balance_due,
  0.00::NUMERIC(10,2) AS prepayments
FROM leases l
JOIN units u ON l.unit_id = u.id
JOIN properties p ON u.property_id = p.id
WHERE l.status = 'active'
ORDER BY p.address, u.unit_number;


-- ============================================================
-- RLS (Row Level Security)
-- Tenants see only their own leases. PMs and admins see all.
-- ============================================================

ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_actions ENABLE ROW LEVEL SECURITY;

-- PM and admin: full access
CREATE POLICY "pm_admin_full_access_leases" ON leases
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('pm', 'admin')
    )
  );

CREATE POLICY "pm_admin_full_access_lease_actions" ON lease_actions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('pm', 'admin')
    )
  );

-- Tenants: read-only, own leases only
CREATE POLICY "tenant_read_own_leases" ON leases
  FOR SELECT
  TO authenticated
  USING (tenant_id = auth.uid());

CREATE POLICY "tenant_read_own_lease_actions" ON lease_actions
  FOR SELECT
  TO authenticated
  USING (
    lease_id IN (
      SELECT id FROM leases WHERE tenant_id = auth.uid()
    )
  );


-- ============================================================
-- FUNCTION: log_lease_action
-- Helper to insert actions cleanly from API routes.
-- ============================================================

CREATE OR REPLACE FUNCTION log_lease_action(
  p_lease_id UUID,
  p_action_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_old_rent NUMERIC DEFAULT NULL,
  p_new_rent NUMERIC DEFAULT NULL,
  p_related_lease_id UUID DEFAULT NULL,
  p_performed_by UUID DEFAULT NULL,
  p_performed_by_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  action_id UUID;
BEGIN
  INSERT INTO lease_actions (
    lease_id, action_type, description, 
    old_rent, new_rent, related_lease_id,
    performed_by, performed_by_name
  ) VALUES (
    p_lease_id, p_action_type, p_description,
    p_old_rent, p_new_rent, p_related_lease_id,
    p_performed_by, p_performed_by_name
  )
  RETURNING id INTO action_id;
  
  RETURN action_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- FUNCTION: process_transfer
-- Handles unit-to-unit transfers (e.g., Libby Unit 8 → Unit 9).
-- Closes old lease, creates new lease, logs both actions.
-- ============================================================

CREATE OR REPLACE FUNCTION process_transfer(
  p_old_lease_id UUID,
  p_new_unit_id UUID,
  p_new_rent NUMERIC,
  p_new_lease_start DATE,
  p_new_lease_end DATE,
  p_performed_by UUID DEFAULT NULL,
  p_performed_by_name TEXT DEFAULT 'System'
)
RETURNS UUID AS $$
DECLARE
  old_lease RECORD;
  new_lease_id UUID;
BEGIN
  -- Get old lease details
  SELECT * INTO old_lease FROM leases WHERE id = p_old_lease_id;
  
  -- Close old lease
  UPDATE leases SET
    status = 'transferred',
    renewal_status = 'transferred',
    move_out_date = p_new_lease_start,
    updated_at = now()
  WHERE id = p_old_lease_id;
  
  -- Create new lease
  INSERT INTO leases (
    unit_id, tenant_id, tenant_name, tenant_email, tenant_phone,
    lease_start, lease_end, monthly_rent, security_deposit,
    lease_type, status, renewal_status,
    transferred_from_lease_id, move_in_date, created_by
  ) VALUES (
    p_new_unit_id, old_lease.tenant_id, old_lease.tenant_name,
    old_lease.tenant_email, old_lease.tenant_phone,
    p_new_lease_start, p_new_lease_end, p_new_rent,
    old_lease.security_deposit, 'fixed', 'active', 'pending',
    p_old_lease_id, p_new_lease_start, p_performed_by
  )
  RETURNING id INTO new_lease_id;
  
  -- Link old lease to new
  UPDATE leases SET transferred_to_lease_id = new_lease_id
  WHERE id = p_old_lease_id;
  
  -- Log actions on both leases
  PERFORM log_lease_action(
    p_old_lease_id, 'transfer_out',
    'Tenant transferred to new unit',
    old_lease.monthly_rent, p_new_rent,
    new_lease_id, p_performed_by, p_performed_by_name
  );
  
  PERFORM log_lease_action(
    new_lease_id, 'transfer_in',
    'Tenant transferred from previous unit',
    old_lease.monthly_rent, p_new_rent,
    p_old_lease_id, p_performed_by, p_performed_by_name
  );
  
  RETURN new_lease_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- NOTE: Column dependencies
-- This migration assumes the following columns exist:
--   units: id, property_id, unit_number, bed_count, bath_count
--   properties: id, address
--   profiles: id, role
--
-- If units doesn't have unit_number, bed_count, bath_count,
-- run these first:
--   ALTER TABLE units ADD COLUMN IF NOT EXISTS unit_number TEXT;
--   ALTER TABLE units ADD COLUMN IF NOT EXISTS bed_count INT;
--   ALTER TABLE units ADD COLUMN IF NOT EXISTS bath_count INT;
-- ============================================================
