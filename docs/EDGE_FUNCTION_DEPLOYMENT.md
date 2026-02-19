# Supabase Edge Function Deployment
**DK Living Tenant Portal - check-renewals Cron Job**

---

## Overview

The `check-renewals` Edge Function runs daily to check lease expiration dates and automatically log renewal review actions.

## What It Does

- **Runs:** Daily at 9 AM UTC (4 AM EST)
- **Checks:** All active fixed-term leases
- **Actions:**
  - At 90 days remaining → Log `renewal_review` action
  - At 60 days remaining → Flag overdue renewal offers
  - At 30 days remaining → Log critical alerts
- **Idempotent:** Won't duplicate actions if run multiple times

---

## Prerequisites

- ✅ Supabase CLI installed
- ✅ Access to terminal
- ✅ Supabase project credentials

---

## Step 1: Install Supabase CLI

### macOS (Homebrew):
```bash
brew install supabase/tap/supabase
```

### Linux:
```bash
npm install -g supabase
```

### Windows:
```bash
npm install -g supabase
```

### Verify Installation:
```bash
supabase --version
```

---

## Step 2: Link to Your Supabase Project

```bash
cd ~/path/to/DK-Living-Tenant-Portal

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

**Find your project ref:**
- Go to Supabase Dashboard
- Click on your project
- Look in URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- Or go to **Settings** → **General** → **Reference ID**

---

## Step 3: Deploy the Function

```bash
# Deploy check-renewals function
supabase functions deploy check-renewals

# Verify deployment
supabase functions list
```

You should see:
```
check-renewals    deployed    2026-02-19T00:00:00Z
```

---

## Step 4: Set Environment Variables

The function needs access to your database:

```bash
# Set Supabase URL
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co

# Set service role key (from Supabase Dashboard → Settings → API)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Step 5: Set Up Cron Schedule

### Option A: Via Supabase Dashboard (Easier)
1. Go to Supabase Dashboard
2. Click **Edge Functions**
3. Find `check-renewals`
4. Click **Settings**
5. Enable **Cron Schedule**
6. Enter: `0 9 * * *` (9 AM UTC daily)
7. Save

### Option B: Via CLI
```bash
supabase functions schedule create \
  --function-name check-renewals \
  --schedule "0 9 * * *"
```

### Cron Schedule Format:
```
 ┌───────────── minute (0 - 59)
 │ ┌───────────── hour (0 - 23)
 │ │ ┌───────────── day of month (1 - 31)
 │ │ │ ┌───────────── month (1 - 12)
 │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday = 0)
 │ │ │ │ │
 * * * * *
```

**Examples:**
- `0 9 * * *` - 9 AM every day
- `0 9 * * 1` - 9 AM every Monday
- `0 */6 * * *` - Every 6 hours
- `0 9,17 * * *` - 9 AM and 5 PM every day

---

## Step 6: Test the Function

### Manual Invocation:
```bash
supabase functions invoke check-renewals
```

### Check Logs:
```bash
supabase functions logs check-renewals
```

### Expected Output:
```json
{
  "success": true,
  "checks_performed": 32,
  "actions_logged": 5,
  "critical_alerts": 2,
  "offer_due_alerts": 3
}
```

---

## Step 7: Monitor

### View Logs:
```bash
# Tail logs in real-time
supabase functions logs check-renewals --tail

# View last 100 lines
supabase functions logs check-renewals --limit 100
```

### Check Database:
```sql
-- View recent renewal actions
SELECT * FROM lease_actions 
WHERE action_type IN ('renewal_review', 'renewal_offer_sent')
ORDER BY performed_at DESC
LIMIT 10;

-- View renewal alerts
SELECT * FROM renewal_alerts
WHERE renewal_stage IN ('critical', 'offer_due', 'review_due')
ORDER BY sort_priority ASC;
```

---

## The Function Code

**Location:** `supabase/functions/check-renewals/index.ts`

**What it does:**
```typescript
// 1. Fetch all active fixed-term leases
const leases = await supabase
  .from('leases')
  .select('*')
  .eq('status', 'active')
  .eq('lease_term', 'fixed')

// 2. Check each lease
for (const lease of leases) {
  const daysRemaining = calculateDays(lease.lease_end)
  
  // 90 days: Log renewal review (if not already logged)
  if (daysRemaining === 90) {
    await logAction(lease.id, 'renewal_review')
  }
  
  // 60 days: Flag overdue offers
  if (daysRemaining === 60 && !offerSent) {
    await logAction(lease.id, 'renewal_offer_due')
  }
  
  // 30 days: Critical alert
  if (daysRemaining === 30 && !offerSent) {
    await logAction(lease.id, 'renewal_critical')
  }
}
```

---

## Troubleshooting

### Function Not Deploying
- ✅ Check Supabase CLI is logged in: `supabase status`
- ✅ Verify project is linked: `supabase projects list`
- ✅ Check TypeScript errors: `deno check supabase/functions/check-renewals/index.ts`

### Function Not Running on Schedule
- ✅ Verify cron schedule is set
- ✅ Check function logs for errors
- ✅ Ensure environment variables are set
- ✅ Test manual invocation first

### Database Errors
- ✅ Check `SUPABASE_SERVICE_ROLE_KEY` is correct
- ✅ Verify RLS policies allow service role access
- ✅ Check function has permission to call `log_lease_action()`

---

## Advanced: Modify Schedule

To change when the function runs:

```bash
# Morning and evening checks (9 AM and 5 PM)
supabase functions schedule update check-renewals --schedule "0 9,17 * * *"

# Run every 12 hours
supabase functions schedule update check-renewals --schedule "0 */12 * * *"

# Weekdays only
supabase functions schedule update check-renewals --schedule "0 9 * * 1-5"
```

---

## Testing Checklist

- [ ] CLI installed and logged in
- [ ] Project linked
- [ ] Function deployed successfully
- [ ] Environment variables set
- [ ] Manual invocation works
- [ ] Cron schedule configured
- [ ] Logs show successful runs
- [ ] Database actions being logged
- [ ] No duplicate actions

---

## Production Checklist

- [ ] Function tested manually
- [ ] Cron schedule set to production time
- [ ] Logs monitored for first few runs
- [ ] Alert if function fails (via Supabase webhook)
- [ ] Document cron schedule for team
- [ ] Test idempotency (run multiple times, no duplicates)

---

## Support

- **Supabase Edge Functions Docs:** https://supabase.com/docs/guides/functions
- **Deno Docs:** https://deno.land/manual
- **Cron Schedule Tool:** https://crontab.guru

---

**Last Updated:** February 19, 2026
