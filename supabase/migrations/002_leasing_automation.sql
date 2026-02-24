-- ============================================================
-- DK Living Tenant Portal — Leasing Automation
-- Migration 002: Showing Management & Lead Pipeline
-- Supports migration from Make.com + Airtable to Supabase
-- ============================================================

-- ============================================================
-- TABLE 1: leasing_leads
-- Tracks prospects from inquiry through lease signing
-- Replaces Airtable pipeline
-- ============================================================

CREATE TABLE IF NOT EXISTS leasing_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Lead source & contact
  source TEXT NOT NULL DEFAULT 'zillow'
    CHECK (source IN ('zillow', 'apartments', 'trulia', 'craigslist', 'facebook', 'referral', 'walk_in', 'other')),
  inquiry_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prospect info
  prospect_name TEXT NOT NULL,
  prospect_email TEXT,
  prospect_phone TEXT,
  prospect_notes TEXT,
  
  -- Property interest
  property_address TEXT NOT NULL,  -- "2061 Forbes St", "830 Lasalle St", etc.
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,  -- Link to specific unit if selected
  desired_move_in DATE,
  
  -- Pipeline stage
  stage TEXT NOT NULL DEFAULT 'new_inquiry'
    CHECK (stage IN (
      'new_inquiry',         -- Just received
      'responded',           -- Initial response sent
      'showing_scheduled',   -- Showing booked
      'showed',              -- Prospect showed up
      'no_show',             -- Prospect didn't show
      'application_sent',    -- Application link sent
      'application_received',-- Application submitted
      'approved',            -- Application approved
      'lease_sent',          -- Lease agreement sent
      'lease_signed',        -- Lease signed
      'lost',                -- Lead went cold
      'not_qualified'        -- Didn't meet criteria
    )),
  
  -- Lead quality scoring (optional, for future prioritization)
  lead_score INTEGER DEFAULT 0,  -- 0-100, AI-generated or manual
  lead_quality TEXT,  -- "hot", "warm", "cold"
  
  -- Automated response tracking
  auto_response_sent BOOLEAN DEFAULT FALSE,
  auto_response_sent_at TIMESTAMPTZ,
  
  -- Follow-up tracking
  last_contact_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  follow_up_count INTEGER DEFAULT 0,
  
  -- Conversion tracking
  converted_to_lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,
  
  -- Loss tracking
  lost_reason TEXT,  -- "chose another property", "budget", "timing", etc.
  lost_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      COALESCE(prospect_name, '') || ' ' || 
      COALESCE(prospect_email, '') || ' ' || 
      COALESCE(prospect_phone, '') || ' ' || 
      COALESCE(property_address, '')
    )
  ) STORED
);

-- Indexes for leasing_leads
CREATE INDEX IF NOT EXISTS idx_leasing_leads_stage ON leasing_leads(stage);
CREATE INDEX IF NOT EXISTS idx_leasing_leads_property ON leasing_leads(property_address);
CREATE INDEX IF NOT EXISTS idx_leasing_leads_inquiry_date ON leasing_leads(inquiry_date DESC);
CREATE INDEX IF NOT EXISTS idx_leasing_leads_next_followup ON leasing_leads(next_follow_up_at) WHERE stage NOT IN ('lease_signed', 'lost', 'not_qualified');
CREATE INDEX IF NOT EXISTS idx_leasing_leads_search ON leasing_leads USING gin(search_vector);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_leasing_leads_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leasing_leads_updated_at
  BEFORE UPDATE ON leasing_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leasing_leads_timestamp();

-- ============================================================
-- TABLE 2: leasing_showings
-- Tracks scheduled showings with smart lock access
-- Replaces Google Calendar → Make.com flow
-- ============================================================

CREATE TABLE IF NOT EXISTS leasing_showings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Link to lead
  lead_id UUID NOT NULL REFERENCES leasing_leads(id) ON DELETE CASCADE,
  
  -- Showing details
  property_address TEXT NOT NULL,
  showing_date DATE NOT NULL,
  showing_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  
  -- Smart lock integration (igloohome)
  access_pin TEXT,  -- Generated PIN code (e.g., "123456")
  pin_valid_from TIMESTAMPTZ,
  pin_valid_until TIMESTAMPTZ,
  igloohome_device_id TEXT,  -- "IGK345396796", etc.
  igloohome_pin_id TEXT,  -- PIN ID from igloohome API (for deletion)
  
  -- SMS confirmation tracking
  confirmation_sent BOOLEAN DEFAULT FALSE,
  confirmation_sent_at TIMESTAMPTZ,
  confirmation_sms_sid TEXT,  -- Twilio message SID
  
  -- Showing status
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'confirmed', 'showed', 'no_show', 'cancelled', 'rescheduled')),
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Attendance detection
  manual_status_override BOOLEAN DEFAULT FALSE,  -- VA manually updated status
  wifi_bridge_detected BOOLEAN DEFAULT FALSE,  -- Future: auto-detect via WiFi Bridge
  
  -- Rescheduling
  rescheduled_to UUID REFERENCES leasing_showings(id) ON DELETE SET NULL,
  rescheduled_from UUID REFERENCES leasing_showings(id) ON DELETE SET NULL,
  cancellation_reason TEXT,
  
  -- Notes
  showing_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Indexes for leasing_showings
CREATE INDEX IF NOT EXISTS idx_leasing_showings_lead ON leasing_showings(lead_id);
CREATE INDEX IF NOT EXISTS idx_leasing_showings_date ON leasing_showings(showing_date DESC);
CREATE INDEX IF NOT EXISTS idx_leasing_showings_status ON leasing_showings(status);
CREATE INDEX IF NOT EXISTS idx_leasing_showings_today 
  ON leasing_showings(showing_date, showing_time) 
  WHERE status IN ('scheduled', 'confirmed');

-- Updated timestamp trigger
CREATE TRIGGER leasing_showings_updated_at
  BEFORE UPDATE ON leasing_showings
  FOR EACH ROW
  EXECUTE FUNCTION update_leasing_leads_timestamp();

-- ============================================================
-- TABLE 3: leasing_followups
-- Tracks automated follow-up messages
-- Replaces Make.com Scenarios 2 & 3
-- ============================================================

CREATE TABLE IF NOT EXISTS leasing_followups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Link to lead & showing (if applicable)
  lead_id UUID NOT NULL REFERENCES leasing_leads(id) ON DELETE CASCADE,
  showing_id UUID REFERENCES leasing_showings(id) ON DELETE SET NULL,
  
  -- Follow-up timing
  followup_type TEXT NOT NULL
    CHECK (followup_type IN ('day_0', 'day_1', 'day_2', 'custom', 'post_showing', 'no_show')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  
  -- Message content
  message_template TEXT NOT NULL,  -- Template key (e.g., "day_1_followup")
  message_content TEXT NOT NULL,  -- Actual message sent
  
  -- SMS tracking (Twilio)
  sms_sid TEXT,  -- Twilio message SID
  sms_status TEXT,  -- "sent", "delivered", "failed"
  sms_error TEXT,  -- Error message if failed
  
  -- Response tracking
  prospect_replied BOOLEAN DEFAULT FALSE,
  prospect_reply_at TIMESTAMPTZ,
  prospect_reply_content TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'sent', 'delivered', 'failed', 'skipped')),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for leasing_followups
CREATE INDEX IF NOT EXISTS idx_leasing_followups_lead ON leasing_followups(lead_id);
CREATE INDEX IF NOT EXISTS idx_leasing_followups_showing ON leasing_followups(showing_id);
CREATE INDEX IF NOT EXISTS idx_leasing_followups_scheduled 
  ON leasing_followups(scheduled_for) 
  WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_leasing_followups_status ON leasing_followups(status);

-- ============================================================
-- TABLE 4: leasing_activity_log
-- Audit trail of all activities (manual + automated)
-- Useful for debugging and reporting
-- ============================================================

CREATE TABLE IF NOT EXISTS leasing_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Link to entities
  lead_id UUID REFERENCES leasing_leads(id) ON DELETE CASCADE,
  showing_id UUID REFERENCES leasing_showings(id) ON DELETE SET NULL,
  
  -- Activity details
  activity_type TEXT NOT NULL,  -- "inquiry_received", "showing_scheduled", "sms_sent", "stage_changed", etc.
  description TEXT NOT NULL,
  metadata JSONB,  -- Flexible field for additional data
  
  -- Actor
  actor_type TEXT NOT NULL DEFAULT 'system'
    CHECK (actor_type IN ('system', 'user', 'automation', 'api')),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_name TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for leasing_activity_log
CREATE INDEX IF NOT EXISTS idx_leasing_activity_lead ON leasing_activity_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_leasing_activity_showing ON leasing_activity_log(showing_id);
CREATE INDEX IF NOT EXISTS idx_leasing_activity_date ON leasing_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leasing_activity_type ON leasing_activity_log(activity_type);

-- ============================================================
-- VIEW 1: leasing_pipeline_view
-- Dashboard-ready view of leads by stage
-- ============================================================

CREATE OR REPLACE VIEW leasing_pipeline_view AS
SELECT 
  stage,
  COUNT(*) AS lead_count,
  COUNT(*) FILTER (WHERE inquiry_date >= NOW() - INTERVAL '7 days') AS new_this_week,
  COUNT(*) FILTER (WHERE inquiry_date >= NOW() - INTERVAL '30 days') AS new_this_month,
  AVG(EXTRACT(DAY FROM (NOW() - inquiry_date))) AS avg_days_in_stage,
  MAX(inquiry_date) AS most_recent_inquiry,
  SUM(CASE WHEN converted_to_lease_id IS NOT NULL THEN 1 ELSE 0 END) AS conversions
FROM leasing_leads
GROUP BY stage
ORDER BY 
  CASE stage
    WHEN 'new_inquiry' THEN 1
    WHEN 'responded' THEN 2
    WHEN 'showing_scheduled' THEN 3
    WHEN 'showed' THEN 4
    WHEN 'application_sent' THEN 5
    WHEN 'application_received' THEN 6
    WHEN 'approved' THEN 7
    WHEN 'lease_sent' THEN 8
    WHEN 'lease_signed' THEN 9
    ELSE 10
  END;

-- ============================================================
-- VIEW 2: todays_showings_view
-- Real-time dashboard of today's scheduled showings
-- ============================================================

CREATE OR REPLACE VIEW todays_showings_view AS
SELECT 
  s.id,
  s.showing_date,
  s.showing_time,
  s.status,
  s.property_address,
  l.prospect_name,
  l.prospect_phone,
  s.access_pin,
  s.confirmation_sent,
  s.showing_notes,
  s.igloohome_device_id,
  CONCAT(s.showing_date::TEXT, ' ', s.showing_time::TEXT) AS showing_datetime
FROM leasing_showings s
JOIN leasing_leads l ON s.lead_id = l.id
WHERE s.showing_date = CURRENT_DATE
  AND s.status IN ('scheduled', 'confirmed')
ORDER BY s.showing_time;

-- ============================================================
-- VIEW 3: pending_followups_view
-- Leads needing follow-up (for cron job)
-- ============================================================

CREATE OR REPLACE VIEW pending_followups_view AS
SELECT 
  l.id,
  l.prospect_name,
  l.prospect_phone,
  l.property_address,
  l.stage,
  l.last_contact_at,
  l.next_follow_up_at,
  l.follow_up_count,
  s.id AS showing_id,
  s.showing_date,
  s.status AS showing_status,
  EXTRACT(DAY FROM (NOW() - s.showing_date)) AS days_since_showing
FROM leasing_leads l
LEFT JOIN leasing_showings s ON s.lead_id = l.id AND s.status IN ('showed', 'no_show')
WHERE l.next_follow_up_at <= NOW()
  AND l.stage NOT IN ('lease_signed', 'lost', 'not_qualified')
ORDER BY l.next_follow_up_at;

-- ============================================================
-- FUNCTION 1: log_leasing_activity
-- Helper function to add activity log entries
-- ============================================================

CREATE OR REPLACE FUNCTION log_leasing_activity(
  p_lead_id UUID,
  p_showing_id UUID,
  p_activity_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_actor_type TEXT DEFAULT 'system',
  p_actor_id UUID DEFAULT NULL,
  p_actor_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO leasing_activity_log (
    lead_id,
    showing_id,
    activity_type,
    description,
    metadata,
    actor_type,
    actor_id,
    actor_name
  ) VALUES (
    p_lead_id,
    p_showing_id,
    p_activity_type,
    p_description,
    p_metadata,
    p_actor_type,
    p_actor_id,
    p_actor_name
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION 2: update_lead_stage
-- Updates lead stage and logs the change
-- ============================================================

CREATE OR REPLACE FUNCTION update_lead_stage(
  p_lead_id UUID,
  p_new_stage TEXT,
  p_actor_id UUID DEFAULT NULL,
  p_actor_name TEXT DEFAULT 'system',
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_old_stage TEXT;
BEGIN
  -- Get current stage
  SELECT stage INTO v_old_stage FROM leasing_leads WHERE id = p_lead_id;
  
  IF v_old_stage IS NULL THEN
    RAISE EXCEPTION 'Lead not found: %', p_lead_id;
  END IF;
  
  -- Update stage
  UPDATE leasing_leads 
  SET stage = p_new_stage,
      last_contact_at = NOW()
  WHERE id = p_lead_id;
  
  -- Log activity
  PERFORM log_leasing_activity(
    p_lead_id,
    NULL,
    'stage_changed',
    FORMAT('Stage changed from %s to %s. %s', v_old_stage, p_new_stage, COALESCE(p_notes, '')),
    jsonb_build_object('old_stage', v_old_stage, 'new_stage', p_new_stage),
    'user',
    p_actor_id,
    p_actor_name
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RLS (Row Level Security) Policies
-- Adjust based on your authentication setup
-- ============================================================

ALTER TABLE leasing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE leasing_showings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leasing_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE leasing_activity_log ENABLE ROW LEVEL SECURITY;

-- Property managers can see all leads
CREATE POLICY "Property managers can view all leads"
  ON leasing_leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('pm', 'admin', 'owner')
    )
  );

CREATE POLICY "Property managers can insert leads"
  ON leasing_leads FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('pm', 'admin', 'owner')
    )
  );

CREATE POLICY "Property managers can update leads"
  ON leasing_leads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('pm', 'admin', 'owner')
    )
  );

-- Similar policies for other tables
CREATE POLICY "Property managers can view all showings"
  ON leasing_showings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('pm', 'admin', 'owner')
    )
  );

CREATE POLICY "Property managers can manage showings"
  ON leasing_showings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('pm', 'admin', 'owner')
    )
  );

CREATE POLICY "Property managers can view followups"
  ON leasing_followups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('pm', 'admin', 'owner')
    )
  );

CREATE POLICY "Property managers can view activity log"
  ON leasing_activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('pm', 'admin', 'owner')
    )
  );

-- ============================================================
-- COMMENTS (Documentation)
-- ============================================================

COMMENT ON TABLE leasing_leads IS 'Prospect pipeline from inquiry to lease signing (replaces Airtable)';
COMMENT ON TABLE leasing_showings IS 'Scheduled property showings with smart lock integration (replaces Google Calendar)';
COMMENT ON TABLE leasing_followups IS 'Automated follow-up messages (replaces Make.com Scenarios 2 & 3)';
COMMENT ON TABLE leasing_activity_log IS 'Audit trail of all leasing activities';

COMMENT ON VIEW leasing_pipeline_view IS 'Dashboard: Lead count by stage with conversion metrics';
COMMENT ON VIEW todays_showings_view IS 'Dashboard: Today''s scheduled showings';
COMMENT ON VIEW pending_followups_view IS 'Cron: Leads needing follow-up messages';

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 002: Leasing Automation completed successfully';
  RAISE NOTICE '📊 Created 4 tables: leasing_leads, leasing_showings, leasing_followups, leasing_activity_log';
  RAISE NOTICE '👁️ Created 3 views: pipeline, todays_showings, pending_followups';
  RAISE NOTICE '🔧 Created 2 helper functions: log_leasing_activity, update_lead_stage';
  RAISE NOTICE '🔒 Enabled RLS policies for property managers';
  RAISE NOTICE '🚀 Ready for Make.com → Portal migration';
END $$;
