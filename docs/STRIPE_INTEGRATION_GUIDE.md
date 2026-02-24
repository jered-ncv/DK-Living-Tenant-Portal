# Stripe Integration Guide
**DK Living Tenant Portal**

---

## Overview

This guide walks you through integrating Stripe for payment processing in the tenant portal.

## Prerequisites

- ✅ Stripe account created
- ✅ Access to Stripe Dashboard
- ✅ Vercel deployment configured

---

## Step 1: Get Stripe API Keys

1. Go to https://dashboard.stripe.com
2. Click **Developers** in the left sidebar
3. Click **API keys**
4. Copy these keys:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)

**⚠️ Security:**
- Never commit secret keys to Git
- Use environment variables only
- Use test keys for development

---

## Step 2: Add Environment Variables

### In Vercel:
1. Go to your project → **Settings** → **Environment Variables**
2. Add these variables:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # (we'll get this in Step 4)
```

### Locally (`.env.local`):
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## Step 3: Test Stripe Integration

The payment flow is already built, you just need to wire up the keys.

### Files Involved:
- `app/api/payments/create-checkout/route.ts` - Creates Stripe checkout session
- `app/api/payments/webhook/route.ts` - Handles webhook events
- `components/tenant/PaymentButton.tsx` - Client-side payment button

### Test the Flow:
1. Log in as a tenant
2. Go to **Make Payment**
3. Click **Pay Rent**
4. Should redirect to Stripe Checkout
5. Use test card: `4242 4242 4242 4242` (any expiry, any CVC)
6. Complete payment
7. Should redirect back to portal
8. Payment should appear in database

---

## Step 4: Set Up Webhooks

Webhooks notify your app when payments succeed/fail.

### Create Webhook:
1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://dk-living-tenant-portal.vercel.app/api/payments/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

### Test Webhook:
1. In Stripe Dashboard → **Developers** → **Webhooks**
2. Click on your webhook
3. Click **Send test webhook**
4. Select `checkout.session.completed`
5. Click **Send test webhook**
6. Check your API logs in Vercel

---

## Step 5: Sync with QuickBooks (Optional)

Once payments are working in Stripe, you can sync them to QuickBooks.

### What Gets Synced:
- Payment received → Create Payment in QBO
- Payment amount → Record against tenant invoice
- Payment date → Use Stripe payment timestamp
- Payment method → "Stripe Online Payment"

### Implementation:
- File: `app/api/payments/webhook/route.ts`
- Add QBO API call after payment confirmation
- Use existing QBO integration (see QBO_INTEGRATION_GUIDE.md)

---

## Troubleshooting

### Webhook Not Receiving Events
- ✅ Check webhook URL is correct
- ✅ Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- ✅ Check webhook logs in Stripe Dashboard
- ✅ Ensure your Vercel deployment is live (not preview)

### Payment Not Recording
- ✅ Check Supabase `payments` table
- ✅ Verify user is authenticated
- ✅ Check API route logs in Vercel
- ✅ Confirm webhook signature verification is passing

### Checkout Session Not Creating
- ✅ Verify `STRIPE_SECRET_KEY` is set
- ✅ Check API route `/api/payments/create-checkout`
- ✅ Ensure user has valid lease/rent amount

---

## Testing Checklist

- [ ] Can create checkout session
- [ ] Redirects to Stripe Checkout
- [ ] Can complete test payment
- [ ] Webhook receives event
- [ ] Payment records in database
- [ ] Tenant balance updates
- [ ] Can view payment history
- [ ] QBO sync works (if integrated)

---

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Test one live payment (small amount)
- [ ] Verify webhook in production
- [ ] Confirm QBO sync (if enabled)
- [ ] Test refund flow
- [ ] Document payment process for tenants
- [ ] Set up email receipts (Stripe automatic)

---

## Support

- **Stripe Docs:** https://stripe.com/docs
- **Stripe Support:** https://support.stripe.com
- **Test Cards:** https://stripe.com/docs/testing

---

**Last Updated:** February 19, 2026
