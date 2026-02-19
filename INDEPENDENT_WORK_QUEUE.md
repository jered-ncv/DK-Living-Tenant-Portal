# Independent Work Queue
**Can be done without owner input**  
**Date:** February 19, 2026

---

## 🎯 High Priority - Quick Wins (1-2 hours each)

### 1. CSV Export for Rent Roll ⭐
**Impact:** High | **Effort:** Low  
**Description:** Wire up the Export button on Rent Roll v2  
**Tasks:**
- Create `/api/leases/export` route
- Generate CSV with all lease data
- Add download handler
- Test with production data

**Why independent:** Clear spec, no UI decisions needed

---

### 2. Loading States & Error Boundaries ⭐
**Impact:** High | **Effort:** Low  
**Description:** Polish all components with better loading/error states  
**Tasks:**
- Add skeleton loaders to RenewalAlertsWidget
- Add skeleton loaders to Rent Roll v2
- Add error boundaries to catch crashes
- Toast notifications for actions (success/error)

**Why independent:** Standard patterns, no design decisions

---

### 3. Deployment Guides ⭐
**Impact:** High | **Effort:** Low  
**Description:** Write step-by-step guides for integrations  
**Tasks:**
- Stripe integration guide
- Asana integration guide
- Supabase Edge Function deployment
- QBO integration guide
- Screenshots and code examples

**Why independent:** Documentation only, no code changes

---

## 🏗️ Medium Priority - Feature Builds (2-4 hours each)

### 4. Lease Management List Page
**Impact:** Medium | **Effort:** Medium  
**Description:** Main list of all leases (dashboard link target)  
**Location:** `app/pm/leasing/lease-management/page.tsx`  
**Tasks:**
- Table view of all leases (active, expired, future)
- Filters: property, status, date range
- Search by tenant name
- Sort by any column
- Link to individual lease detail pages
- Pagination (if >50 leases)

**Why independent:** Similar to rent roll, I know the pattern

---

### 5. Quick Action Buttons on Lease Detail
**Impact:** Medium | **Effort:** Medium  
**Description:** Make the sidebar action buttons work  
**Location:** `app/pm/leasing/lease-management/[id]/page.tsx`  
**Tasks:**
- "Send Renewal Offer" → Modal with rent input → POST to /api/leases/[id]/actions
- "Log Notice" → Modal with date picker → POST to /api/leases/[id]/actions
- "Edit Lease" → Form modal (rent, dates, status)
- Success/error toast notifications

**Why independent:** API routes exist, just need UI forms

---

### 6. Property Detail Page Enhancements
**Impact:** Medium | **Effort:** Medium  
**Description:** Better property overview page  
**Location:** `app/pm/rentals/properties/[id]/page.tsx` (exists, enhance it)  
**Tasks:**
- Show all units in a table
- Quick stats card: occupancy rate, total rent, vacant units
- Recent lease activity
- Link to add new unit
- Edit property button

**Why independent:** Page exists, just adding features

---

### 7. Mobile Responsive Audit
**Impact:** Medium | **Effort:** Medium  
**Description:** Test and fix mobile experience  
**Tasks:**
- Test all new pages on mobile viewport
- Fix rent roll table overflow
- Ensure filters work on mobile
- Test navigation on mobile
- Fix any button sizing issues
- Document mobile-specific issues

**Why independent:** Testing and standard responsive patterns

---

## 🚀 Lower Priority - Larger Features (4+ hours each)

### 8. Add Lease Modal/Form
**Impact:** High | **Effort:** High  
**Description:** Create full lease creation flow  
**Tasks:**
- Multi-step form (tenant → unit → terms)
- Tenant search/select or create new
- Unit dropdown (vacant only)
- Lease dates with validation
- Rent and deposit inputs
- POST to /api/leases
- Auto-log lease_created action
- Redirect to new lease detail page

**Why independent:** API exists, just needs comprehensive form

---

### 9. Tenant Profile Pages
**Impact:** Medium | **Effort:** High  
**Description:** Individual tenant detail pages  
**Location:** `app/pm/rentals/tenants/[id]/page.tsx`  
**Tasks:**
- Tenant info card
- Current lease info with link
- Lease history (past leases)
- Payment history (once Stripe connected)
- Maintenance requests
- Communication history
- Edit tenant button

**Why independent:** Data model is clear, standard CRUD patterns

---

### 10. Dashboard Widgets Enhancement
**Impact:** Low | **Effort:** Medium  
**Description:** Add more useful widgets to PM Dashboard  
**Tasks:**
- Recent payments widget (once Stripe connected)
- Vacant units widget (link to leasing)
- Recent maintenance requests (top 5)
- Upcoming move-ins/move-outs (next 30 days)
- Portfolio stats (total rent, occupancy %)

**Why independent:** Data is available, just needs UI

---

## 🔧 Technical Debt & Polish

### 11. Component Documentation
**Impact:** Low | **Effort:** Low  
**Description:** Add JSDoc comments to all components  
**Tasks:**
- Document props for all components
- Add usage examples
- Type definitions with descriptions
- Create component README

**Why independent:** Code documentation

---

### 12. API Route Tests
**Impact:** Medium | **Effort:** Medium  
**Description:** Add tests for critical API routes  
**Tasks:**
- Test /api/leases GET/POST
- Test /api/leases/[id]/actions
- Test authentication/authorization
- Mock Supabase responses

**Why independent:** Testing, no feature changes

---

## 🎨 UX Improvements

### 13. Empty States
**Impact:** Low | **Effort:** Low  
**Description:** Better empty states across app  
**Tasks:**
- Rent roll when no leases
- Renewal alerts when none active
- Lease timeline when no actions
- Call-to-action buttons on empty states

**Why independent:** Standard UX patterns

---

### 14. Confirmation Dialogs
**Impact:** Medium | **Effort:** Low  
**Description:** Add confirmations for destructive actions  
**Tasks:**
- "Are you sure?" for Mark Not Renewing
- "Confirm" for sending renewal offers
- Warning dialogs with escape hatch

**Why independent:** Standard safety pattern

---

## 📊 My Recommendation for Tonight

**If you want me to work independently, here's my plan:**

### Phase 1: Quick Polish (2-3 hours)
1. CSV Export (1 hour)
2. Loading States & Error Handling (1-2 hours)

### Phase 2: High-Value Features (3-4 hours)
3. Lease Management List Page (2 hours)
4. Quick Action Buttons on Lease Detail (2 hours)

### Phase 3: Documentation (1 hour)
5. Deployment Guides (1 hour)

**Total Time:** 6-8 hours  
**Total Value:** High (polish + 2 major features + documentation)

---

## ✋ What I WON'T Do Without Permission

- Change color schemes or major design elements
- Add external dependencies without approval
- Modify database schema
- Deploy Supabase Edge Functions (need your CLI access)
- Anything that costs money (API keys, services)
- Delete or archive existing code

---

## 🚦 How to Kick Me Off

Just say:
- "Work on #1, #2, and #5" (specific tasks)
- "Focus on polish tonight" (loading, errors, empty states)
- "Build new features" (lease list, action buttons)
- "Write documentation" (guides, comments)
- "Surprise me" (I'll pick the highest value items)

Or just tell me "not tonight" and I'll stand by! 👍

---

*Queue compiled by Clawdbot 🤖*
