# DK Living Tenant Portal — OpenClaw Briefing
## February 16, 2026

---

## Project Overview

Custom property management portal replacing Buildium for DK Living's 35-unit LTR portfolio across 3 Jacksonville, FL properties. Built on Next.js 14 + Supabase + TypeScript + Tailwind CSS.

**Repo:** github.com/jered-ncv/DK-Living-Tenant-Portal
**Supabase project:** tenant-portal (jered-ncv's Org, PRODUCTION branch on main)
**Target deployment:** Vercel (not yet deployed)

---

## What Was Just Built (Feb 14–16, 2026)

### Database Changes (already live in Supabase PRODUCTION)

These changes were run directly in Supabase SQL Editor and are now live. The SQL files are being added to the repo under `supabase/` for documentation.

**1. Added columns to `units` table:**
```sql
ALTER TABLE units ADD COLUMN IF NOT EXISTS bed_count INT;
ALTER TABLE units ADD COLUMN IF NOT EXISTS bath_count INT;
```

**2. New table: `leases`**
- Replaces the flat `tenant_id` + `lease_start_date` + `lease_end_date` on `units`
- Every lease gets its own row (supports history, not just current snapshot)
- Tracks: tenant info (denormalized), lease terms, renewal status, transfer tracking, move-in/out, notices
- Status: `active`, `pending`, `renewed`, `expired`, `terminated`, `transferred`
- Renewal status: `pending`, `offer_sent`, `accepted`, `declined`, `not_renewing`, `transferred`
- Full schema in `supabase/migrations/001_lease_tracking.sql`

**3. New table: `lease_actions`**
- Event log for every lease lifecycle action
- Action types: `lease_created`, `renewal_review`, `renewal_offer_sent`, `renewal_accepted`, `renewal_declined`, `rent_increase`, `notice_received`, `non_renewal_sent`, `transfer_out`, `transfer_in`, `lease_signed`, `move_in`, `move_out`, `lease_terminated`, `note`
- Links to lease_id, tracks old_rent/new_rent for changes, performed_by for audit

**4. New views:**
- `renewal_alerts` — Active leases with `days_remaining` and `renewal_stage` (critical/offer_due/review_due/no_action). Powers the PM dashboard.
- `rent_roll_view` — Replaces Buildium rent roll. Active leases with tenant, rent, deposit, days remaining. Has placeholder `balance_due` and `prepayments` columns for when Stripe/QBO syncs.
- `lease_history` — Full timeline per unit including action logs as JSON aggregate.

**5. New functions:**
- `log_lease_action(p_lease_id, p_action_type, p_description, p_old_rent, p_new_rent, p_related_lease_id, p_performed_by, p_performed_by_name)` — Helper for inserting actions from API routes. SECURITY DEFINER.
- `process_transfer(p_old_lease_id, p_new_unit_id, p_new_rent, p_new_lease_start, p_new_lease_end, p_performed_by, p_performed_by_name)` — Handles unit-to-unit transfers. Closes old lease (status=transferred), creates new lease, links both, logs actions on both. SECURITY DEFINER.

**6. RLS policies:**
- PM and admin roles: full access to `leases` and `lease_actions`
- Tenants: read-only on own leases and own lease_actions
- Both tables have RLS enabled

**7. Data seeded (32 active leases across 35 units):**
- All tenant names, lease dates, rents, deposits from Buildium rent rolls
- Renewal statuses set for known decisions (Emery=not_renewing, Libby=transferred, Long=not_renewing, Jensen/Dilts=accepted MTM, Hernandez/Palmer=accepted 12mo)
- 4 placeholder tenant names on Lasalle U14-16 and U17 (U17 = 1610 River Rd)
- `lease_created` actions logged for all 32 leases
- Seed script in `supabase/seed/seed_leases.sql`

**8. Added property:**
- 2061 Forbes St inserted into `properties` table with ID: `b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab`

### API Routes (already pushed to GitHub)

Located in `app/api/leases/`:

**`GET /api/leases`**
- Query params: `?view=renewal_alerts` | `rent_roll` | `all`, `&property_id=xxx`, `&status=active`
- Auth required, PM/admin role check
- Returns lease data with unit and property joins

**`POST /api/leases`**
- Creates new lease, auto-logs `lease_created` action
- Auth required

**`GET /api/leases/[id]/actions`**
- Returns full action timeline for a lease, ordered chronologically

**`POST /api/leases/[id]/actions`**
- Body: `{ action_type, description?, old_rent?, new_rent?, related_lease_id?, notice_type?, move_out_date? }`
- Logs the action AND auto-updates lease status based on action type (e.g., `renewal_offer_sent` updates `renewal_status` to `offer_sent`)

**`POST /api/leases/[id]/transfer`**
- Body: `{ new_unit_id, new_rent, new_lease_start, new_lease_end }`
- Calls `process_transfer()` function
- Returns both old and new lease data

### Edge Function (NOT YET DEPLOYED — needs Supabase CLI)

`supabase/functions/check-renewals/index.ts`
- Daily cron job (target: 9 AM UTC / 4 AM EST)
- Checks all active fixed-term leases
- Auto-logs `renewal_review` at 90 days
- Flags overdue offers at 60 days
- Logs critical alerts at 30 days
- Idempotent — checks for existing review actions before duplicating

---

## Existing Schema Reference

**`properties`**: id (uuid), name, address, qbo_customer_id, is_active, created_at, updated_at

**`units`**: id (uuid), property_id (FK→properties), unit_number, tenant_id (FK→profiles), qbo_customer_id, monthly_rent, lease_start_date, lease_end_date, bed_count (NEW), bath_count (NEW), created_at, updated_at

**`profiles`**: id (uuid, FK→auth.users), email, full_name, phone, role (tenant/pm/admin), created_at, updated_at

**`payments`**: Stripe integration, status tracking (built but needs credentials)

**`maintenance_requests`**: Categorized with urgency, Asana task linking (built but needs credentials)

**`maintenance_photos`**, **`messages`**, **`announcements`**: Built, standard CRUD

### Property IDs in Supabase
```
830 Lasalle:    fafd0a16-7bbd-41b6-a091-05887749902d
2061 Forbes:    b7c2e1a4-5d3f-4a8b-9e6c-1234567890ab
2735 Riverside: 3ebf89a9-438c-48ef-aee1-76673863d6e2
Test Property:  0d5ff71d-a602-4e03-bad0-bc3454fd99df  (can be deleted)
```

---

## Outstanding Work — Portal

### Priority 1: Deploy & Go Live

**1. Deploy to Vercel**
- Connect GitHub repo to Vercel
- Set environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- Deploy main branch
- Estimated effort: 30 minutes

**2. Stripe Integration**
- Credentials needed from owner (Stripe account exists, keys not configured)
- Wire up payment flow: tenant selects amount → Stripe checkout → webhook confirms → payment record in Supabase
- QBO sync: post payment to QuickBooks when Stripe webhook fires
- Estimated effort: 2-4 hours

**3. Asana Integration**
- Credentials needed from owner (Asana account exists)
- Maintenance request → creates Asana task → tracks status back in portal
- Estimated effort: 1-2 hours

### Priority 2: PM Dashboard Enhancements

**4. Renewal Alerts Dashboard Widget**
- The `renewal_alerts` view is live and returning data
- Build a React component that hits `GET /api/leases?view=renewal_alerts`
- Display as a table/card view sorted by urgency
- Color code: critical (red), offer_due (orange), review_due (yellow), no_action (green)
- Include action buttons: "Send Renewal Offer", "Log Notice", "Mark Not Renewing"
- Each action button should POST to `/api/leases/[id]/actions` with the appropriate action_type

**5. Rent Roll Page**
- The `rent_roll_view` is live
- Build a React component that hits `GET /api/leases?view=rent_roll`
- Display as a table grouped by property
- Include totals row per property and grand total
- Balance columns are placeholders (0.00) until Stripe/QBO integration

**6. Lease Timeline Component**
- For individual lease detail pages
- Hit `GET /api/leases/[id]/actions` to get the action log
- Display as a vertical timeline with action type icons, descriptions, dates, performed_by
- Include ability to add notes (POST to actions with action_type='note')

### Priority 3: Automation & Integration

**7. Deploy check-renewals cron function**
- Requires Supabase CLI (`npm install -g supabase`)
- `supabase functions deploy check-renewals`
- Schedule via Supabase Dashboard or CLI
- Target: daily at 9 AM UTC

**8. QBO API Integration**
- Build real balance fetching (currently mocked)
- Post payments to QBO when received via Stripe
- Populate `balance_due` and `prepayments` in rent_roll_view
- Estimated effort: 4-8 hours (QBO OAuth + API calls)

**9. Tenant Onboarding Flow**
- Invite existing tenants to create portal accounts
- Link profile to lease via tenant_id
- Email template with login instructions
- Estimated effort: 2-3 hours

### Priority 4: Future Features

**10. Leasing Pipeline Module**
- Lead tracking in Supabase (currently in Airtable)
- Integration with igloohome API for automated showing codes
- Twilio SMS integration for automated follow-up sequences
- This replaces the current Airtable + Quo/OpenPhone setup

**11. Screening Integration**
- Buildium currently handles credit + background checks
- Need standalone solution: TransUnion SmartMove, RentPrep, or custom integration
- This is the last blocker before Buildium can be fully dropped

**12. Late Fee Automation**
- Auto-calculate late fees based on lease terms and payment history
- Florida allows reasonable late fees after grace period
- Post to tenant balance and QBO

---

## Files Being Added to Repo

```
supabase/
├── migrations/
│   └── 001_lease_tracking.sql    # Full migration (tables, views, functions, RLS)
├── seed/
│   └── seed_leases.sql           # All 35 units + 32 leases from Buildium
└── functions/
    └── check-renewals/
        └── index.ts              # Daily renewal alert cron job
```

These are documentation of what's already been applied to the production database. They do NOT need to be run again.

---

## Current Lease Snapshot (as of Feb 16, 2026)

### Critical / Immediate
| Property | Unit | Tenant | Rent | Lease End | Status |
|----------|------|--------|------|-----------|--------|
| Forbes | 8 | Michael Libby | $1,400 | 3/9/2026 | Transferring to U9 at $1,600 |
| Forbes | 9 | Lindsay Long | $1,725 | 3/9/2026 | Moving out — Libby taking unit |
| Lasalle | 6 | Holli Emery | $1,775 | 3/31/2026 | Not renewing. $6,652.50 balance |
| Lasalle | 17 | 1610 River Rd | $1,400 | 2/28/2026 | Vacant — active on Zillow |

### Recently Resolved
| Property | Unit | Tenant | Action |
|----------|------|--------|--------|
| Forbes | 2 | Jensen/Dilts | Renewed month-to-month at $1,500 |
| Forbes | 11 | Hernandez/Palmer | Renewed 12 months at $1,400 through 3/17/2027 |

### Vacant
| Property | Unit | Type | Target Rent |
|----------|------|------|-------------|
| Lasalle | 11 | 2B/1B | $1,800 |
| Lasalle | 17 (1610 River Rd) | 1B/1B | $1,400 |
| Riverside | 1A | 1B/1B | ~$1,350 |
| Riverside | 2 | Studio/1B | ~$1,350 |

---

## Tech Notes

- Auth uses Supabase Auth with email/password. Roles enforced via `profiles.role` column with CHECK constraint.
- All API routes use `createRouteHandlerClient` from `@supabase/auth-helpers-nextjs`
- The `units` table still has `tenant_id`, `lease_start_date`, `lease_end_date` — these are legacy columns. The `leases` table is now the source of truth. Eventually these columns should be deprecated or kept in sync via triggers.
- The test property (ID: `0d5ff71d-a602-4e03-bad0-bc3454fd99df`) and its unit can be safely deleted.
- Existing PM dashboard and rent roll pages in `app/pm/` may need to be rewired to use the new API routes and views instead of querying `units` directly.
