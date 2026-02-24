# QuickBooks Online Integration Guide
**DK Living Tenant Portal**

---

## Overview

This guide walks you through integrating QuickBooks Online (QBO) for accounting sync.

## What Gets Synced

- **Payments:** Stripe → Portal → QBO
- **Invoices:** Monthly rent charges
- **Tenants:** Customer records
- **Properties:** Classes or Locations

---

## Prerequisites

- ✅ QuickBooks Online account
- ✅ QuickBooks Online developer account
- ✅ Vercel deployment configured
- ✅ Stripe integration working (for payments)

---

## Step 1: Create QuickBooks Developer App

1. Go to https://developer.intuit.com
2. Sign in with your Intuit account
3. Click **Dashboard**
4. Click **Create an app**
5. Choose **QuickBooks Online and Payments**
6. Name your app: "DK Living Portal"
7. Click **Create app**

---

## Step 2: Get OAuth Credentials

1. In your app → Click **Keys & credentials**
2. Choose **Production** tab (or Development for testing)
3. Copy these values:
   - **Client ID**
   - **Client Secret**
4. Set **Redirect URIs:**
   - `https://dk-living-tenant-portal.vercel.app/api/qbo/callback`
   - `http://localhost:3000/api/qbo/callback` (for local testing)

---

## Step 3: Add Environment Variables

### In Vercel:
```bash
QBO_CLIENT_ID=your_client_id
QBO_CLIENT_SECRET=your_client_secret
QBO_REDIRECT_URI=https://dk-living-tenant-portal.vercel.app/api/qbo/callback
QBO_ENVIRONMENT=production  # or "sandbox" for testing
```

### Locally (`.env.local`):
```bash
QBO_CLIENT_ID=your_client_id
QBO_CLIENT_SECRET=your_client_secret
QBO_REDIRECT_URI=http://localhost:3000/api/qbo/callback
QBO_ENVIRONMENT=sandbox
```

---

## Step 4: Connect Your QuickBooks Account

1. Deploy your app to Vercel
2. Go to `/pm/settings/integrations` (or wherever you place the connect button)
3. Click **Connect to QuickBooks**
4. Sign in to your QuickBooks account
5. Authorize the app
6. You'll be redirected back to the portal
7. Connection tokens stored securely in Supabase

---

## Step 5: Sync Entities

### Sync Flow:
```
Portal → QuickBooks
---------→---------
Tenant  → Customer
Payment → Payment
Lease   → Invoice
Property → Class
Unit    → Product/Service
```

### What to Sync First:
1. **Properties** → Classes (for reporting by property)
2. **Tenants** → Customers (with property class)
3. **Units** → Products/Services (monthly rent items)
4. **Leases** → Recurring invoices (if applicable)

---

## API Endpoints

### Sync Payment to QBO
```typescript
POST /api/qbo/sync-payment

{
  "payment_id": "stripe_payment_id",
  "tenant_id": "tenant_uuid",
  "amount": 1500.00,
  "date": "2026-02-19",
  "invoice_id": "qbo_invoice_id"  // optional
}
```

### Create Customer (Tenant)
```typescript
POST /api/qbo/create-customer

{
  "tenant_id": "tenant_uuid",
  "full_name": "John Smith",
  "email": "john@example.com",
  "phone": "(904) 555-1234",
  "property_class": "830 Lasalle"  // for class tracking
}
```

### Create Invoice
```typescript
POST /api/qbo/create-invoice

{
  "tenant_id": "tenant_uuid",
  "amount": 1500.00,
  "due_date": "2026-03-01",
  "description": "March 2026 Rent - 830 Lasalle Unit 5",
  "item_id": "rent_item_id"
}
```

---

## QuickBooks Setup

### 1. Set Up Classes (Properties)
Go to **Settings** → **Company** → **All Lists** → **Classes**

Create a class for each property:
- 830 Lasalle
- 2061 Forbes
- 2735 Riverside

### 2. Create Products/Services
Go to **Settings** → **Company** → **All Lists** → **Products and Services**

Create items for:
- **Rent** (Income account)
- **Security Deposit** (Liability account)
- **Late Fee** (Income account)
- **Maintenance Charges** (Income account)

### 3. Set Up Chart of Accounts
Ensure you have these accounts:
- **Rental Income** (Income)
- **Security Deposits Held** (Other Current Liability)
- **Accounts Receivable** (Accounts Receivable)

---

## Sync Triggers

### When to Sync:

**Real-time (via webhook):**
- ✅ Payment received in Stripe → Create Payment in QBO
- ✅ Late fee assessed → Create Invoice in QBO
- ✅ Security deposit held → Record Liability in QBO

**Batch (daily cron):**
- Monthly invoices generation (1st of month)
- Balance reconciliation
- Tenant list sync

---

## Data Mapping

### Tenant → Customer
```typescript
{
  DisplayName: tenant.full_name,
  PrimaryEmailAddr: { Address: tenant.email },
  PrimaryPhone: { FreeFormNumber: tenant.phone },
  ClassRef: { value: property.qbo_class_id },
  Notes: `Unit: ${unit.unit_number}`
}
```

### Payment → QBO Payment
```typescript
{
  CustomerRef: { value: tenant.qbo_customer_id },
  TotalAmt: payment.amount,
  TxnDate: payment.date,
  PaymentMethodRef: { value: "Stripe" },
  DepositToAccountRef: { value: bank_account_id },
  Line: [{
    Amount: payment.amount,
    LinkedTxn: [{ TxnId: invoice.qbo_invoice_id, TxnType: "Invoice" }]
  }]
}
```

### Lease → Invoice
```typescript
{
  CustomerRef: { value: tenant.qbo_customer_id },
  TxnDate: lease.lease_start,
  DueDate: first_of_month,
  ClassRef: { value: property.qbo_class_id },
  Line: [{
    Amount: lease.monthly_rent,
    DetailType: "SalesItemLineDetail",
    SalesItemLineDetail: {
      ItemRef: { value: rent_item_id },
      Qty: 1,
      UnitPrice: lease.monthly_rent
    },
    Description: `${property.name} - Unit ${unit.unit_number}`
  }]
}
```

---

## Error Handling

### Token Expiration
QBO OAuth tokens expire after 1 hour. Refresh tokens are valid for 100 days.

**Auto-refresh logic:**
```typescript
if (tokenExpired) {
  const newTokens = await refreshQBOToken(refreshToken)
  await saveTokens(newTokens)
}
```

### Duplicate Detection
Before creating, check if entity exists:
```typescript
// Check if customer exists by email
const existing = await qbo.findCustomers({ email: tenant.email })
if (existing.length > 0) {
  return existing[0].Id
}
```

### Sync Failures
- Log all sync attempts to `qbo_sync_log` table
- Retry failed syncs up to 3 times
- Alert PM if sync fails repeatedly

---

## Testing

### Sandbox Testing:
1. Create sandbox company at https://developer.intuit.com
2. Use `QBO_ENVIRONMENT=sandbox`
3. Test all sync operations
4. Verify data in sandbox QBO

### Test Cases:
- [ ] Sync new tenant as customer
- [ ] Create monthly invoice
- [ ] Record payment from Stripe
- [ ] Apply payment to invoice
- [ ] Handle late payment / late fee
- [ ] Process security deposit
- [ ] Refund handling

---

## Production Checklist

- [ ] OAuth credentials configured
- [ ] Production QBO account connected
- [ ] All properties mapped to classes
- [ ] Products/Services created
- [ ] Chart of Accounts verified
- [ ] Test sync manually
- [ ] Enable automatic syncing
- [ ] Monitor sync logs
- [ ] Train team on QBO + Portal workflow

---

## Troubleshooting

### "Invalid Token" Error
- ✅ Check token expiration
- ✅ Refresh token if expired
- ✅ Reconnect if refresh token invalid

### "Entity Already Exists"
- ✅ Implement duplicate checking
- ✅ Use "update" instead of "create"
- ✅ Store QBO IDs in portal database

### Sync Not Triggering
- ✅ Check webhook configuration
- ✅ Verify API route is accessible
- ✅ Check logs for errors

---

## Best Practices

### Avoid Duplicates
- Store QBO entity IDs in portal database
- Check existence before creating
- Use unique identifiers (email for customers)

### Keep Data Fresh
- Sync nightly (batch)
- Real-time for critical operations (payments)
- Cache QBO data with TTL

### Error Recovery
- Log all sync operations
- Implement retry logic with exponential backoff
- Alert on repeated failures

---

## Resources

- **QBO API Docs:** https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/customer
- **OAuth Guide:** https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0
- **API Explorer:** https://developer.intuit.com/app/developer/qbo/docs/api/accounting/api-explorer

---

**Last Updated:** February 19, 2026
