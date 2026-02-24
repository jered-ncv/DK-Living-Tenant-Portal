# Stripe Connect Update — What Changed

## Overview

The payment flow now uses Stripe Connect to route rent payments to the correct property LLC's bank account. DK Living automatically takes a 10% management fee on every payment.

**Example:** Tenant pays $1,700 rent at Forbes
- $170 (10%) → DK Living Property Management LLC
- $1,530 (90%) → 2061 Forbes St LLC
- Stripe processing fee (~2.9% + $0.30) deducted from Forbes' portion

## Files Changed (replace the originals from the P1 package)

```
lib/stripe.ts                              → Updated with PLATFORM_FEE_PERCENT
app/api/payments/create-intent/route.ts    → Connect routing + application_fee
app/api/payments/webhook/route.ts          → Connect-aware payment tracking
config/.env.example                        → Test keys pre-filled
supabase/migrations/002_stripe_connect.sql → New columns + account mapping
```

## Setup Steps

### 1. Run the SQL migration
Go to Supabase SQL Editor and run `002_stripe_connect.sql`. This:
- Adds `stripe_connect_account_id` to the `properties` table
- Maps the three test connected account IDs to your properties
- Adds Connect-related columns to `payments` table

### 2. Replace the files in your repo
Copy the updated files over the originals from the P1 package.

### 3. Verify the mapping
After running the SQL, check that it worked:
```sql
SELECT address, stripe_connect_account_id FROM properties;
```

You should see:
| address | stripe_connect_account_id |
|---------|--------------------------|
| 2735 Riverside Ave | acct_1T4QLwGXMRRJuuDM |
| 830 Lasalle St | acct_1T4QQ5GXMR0vvOA8 |
| 2061 Forbes St | acct_1T4QP3GXMRVXGdV2 |

### 4. When going live
- Switch Stripe to live mode
- Create live connected accounts for each property LLC (complete onboarding with real bank accounts)
- Update the `stripe_connect_account_id` values in the `properties` table with the live account IDs
- Replace `sk_test_` and `pk_test_` keys with `sk_live_` and `pk_live_` keys in Vercel env vars

## Payment Flow (Technical)

```
Tenant clicks "Pay Rent"
  → Frontend calls POST /api/payments/create-intent
    → Server looks up unit → gets property → gets stripe_connect_account_id
    → Creates Stripe PaymentIntent with:
        transfer_data.destination = connected account ID
        application_fee_amount = 10% of payment
    → Returns clientSecret to frontend

Tenant enters card details (Stripe Elements)
  → Stripe processes payment
  → Webhook fires: payment_intent.succeeded
    → Server updates payment record in Supabase
    → Money splits: 10% to DK Living, 90% to property LLC
```

## Connected Account IDs (Sandbox)

| Property | Account ID | Status |
|----------|-----------|--------|
| 2735 Riverside Ave | acct_1T4QLwGXMRRJuuDM | Restricted (sandbox) |
| 830 Lasalle St | acct_1T4QQ5GXMR0vvOA8 | Restricted (sandbox) |
| 2061 Forbes St | acct_1T4QP3GXMRVXGdV2 | Restricted (sandbox) |
