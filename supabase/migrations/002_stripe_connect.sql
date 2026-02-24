-- ============================================================
-- DK Living Tenant Portal — Stripe Connect Migration
-- Run in: Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- 1. Add Stripe Connect account ID to properties
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT;

-- 2. Map connected account IDs to properties (SANDBOX / TEST MODE)
-- Update these with LIVE account IDs when switching to production

-- 2735 Riverside Ave
UPDATE properties
SET stripe_connect_account_id = 'acct_1T4QLwGXMRRJuuDM'
WHERE address ILIKE '%2735%Riverside%';

-- 830 Lasalle St
UPDATE properties
SET stripe_connect_account_id = 'acct_1T4QQ5GXMR0vvOA8'
WHERE address ILIKE '%830%Lasalle%';

-- 2061 Forbes St
UPDATE properties
SET stripe_connect_account_id = 'acct_1T4QP3GXMRVXGdV2'
WHERE id = 'b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab';

-- 3. Add Connect-related columns to payments table
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT,
ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- 4. Verify the mapping
SELECT id, address, stripe_connect_account_id
FROM properties
WHERE stripe_connect_account_id IS NOT NULL;
