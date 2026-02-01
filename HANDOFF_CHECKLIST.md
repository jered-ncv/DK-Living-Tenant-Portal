# Handoff Checklist

Quick reference for picking up where this session left off.

---

## ✅ What's Complete

- [x] Next.js 14+ project with TypeScript and Tailwind CSS
- [x] All dependencies installed
- [x] Supabase schema designed and documented
- [x] TypeScript types for database
- [x] Supabase client utilities (browser, server, middleware)
- [x] Authentication pages (login, signup)
- [x] Dashboard page with data fetching
- [x] Route protection middleware
- [x] Environment variable templates
- [x] Comprehensive documentation (5 markdown files)
- [x] Git repository initialized with first commit

---

## 🔧 Setup Required Before Development

### 1. Create Supabase Project (10 minutes)
- [ ] Sign up at [https://supabase.com](https://supabase.com)
- [ ] Create new project: "tenant-portal-dev"
- [ ] Save database password
- [ ] Copy URL and API keys to `.env.local`
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Verify tables created in Table Editor
- [ ] Create storage bucket: "maintenance-photos"

**See: SETUP_GUIDE.md for detailed steps**

### 2. Configure Environment Variables (2 minutes)
```bash
cd /home/ubuntu/clawd/tenant-portal
cp .env.local.example .env.local
# Edit .env.local with Supabase credentials
```

### 3. Test the App (2 minutes)
```bash
npm run dev
# Visit http://localhost:3000
# Try signup/login flow
```

### 4. Create Test Data (5 minutes)
- [ ] Sign up with test account (test@example.com)
- [ ] Run SQL queries from SETUP_GUIDE.md to create:
  - [ ] Test property
  - [ ] Test unit assigned to your account
- [ ] Verify dashboard shows property/unit info

**Total setup time: ~20 minutes**

---

## 📋 Next Development Tasks

### Immediate (Week 1 Remaining): Payment Flow

**Priority 1: Mock UI (1 hour)**
- [ ] Create `app/payments/page.tsx`
- [ ] Display hardcoded balance ($1,200.00)
- [ ] Create payment form UI (no Stripe yet)
- [ ] Add success confirmation page

**Priority 2: Stripe Integration (2-3 hours)**
- [ ] Get Stripe test API keys
- [ ] Add keys to `.env.local`
- [ ] Install Stripe Elements (`@stripe/react-stripe-js`)
- [ ] Create `app/api/payments/create-intent/route.ts`
- [ ] Integrate Stripe Elements in payment form
- [ ] Test with test card: 4242 4242 4242 4242

**Priority 3: QBO Integration (2-3 hours)**
- [ ] Set up QBO developer app
- [ ] Implement OAuth flow (or get refresh token from Jered)
- [ ] Create `app/api/qbo/balance/route.ts`
- [ ] Fetch real balance instead of hardcoded value
- [ ] Create `app/api/qbo/record-payment/route.ts`
- [ ] Post payments to QBO after Stripe success

**Priority 4: Payment History (1-2 hours)**
- [ ] Create `app/payments/history/page.tsx`
- [ ] Fetch payments from database
- [ ] Display in table with filters
- [ ] Add receipt download button (generate PDF or link to Stripe)

**Total estimated time: 6-9 hours**

---

## 🗂️ File Structure Reference

### Pages to Create
```
app/
├── payments/
│   ├── page.tsx              # Main payment page
│   ├── success/page.tsx      # Payment success
│   └── history/page.tsx      # Payment history
```

### API Routes to Create
```
app/api/
├── payments/
│   ├── create-intent/route.ts
│   ├── confirm/route.ts
│   └── webhook/route.ts
├── qbo/
│   ├── balance/route.ts
│   └── record-payment/route.ts
```

### Components to Create (Optional)
```
components/
├── PaymentForm.tsx           # Stripe Elements form
├── BalanceCard.tsx          # Display balance
└── PaymentHistory.tsx       # Payment list table
```

---

## 📚 Documentation Reference

| File | What It Contains |
|------|-----------------|
| `README.md` | Project overview, getting started, structure |
| `SETUP_GUIDE.md` | Step-by-step Supabase setup instructions |
| `PROJECT_STATUS.md` | Detailed progress tracking, all TODO lists |
| `TECH_STACK.md` | Technology choices and rationale |
| `PHASE1_WEEK1_REPORT.md` | Week 1 summary for Jered |
| `HANDOFF_CHECKLIST.md` | This file - quick reference |

---

## 🔑 API Keys Needed

### For Testing Now
- [x] Supabase URL and keys (get from Supabase dashboard)

### For Payment Flow (Week 1)
- [ ] Stripe test keys (sign up at stripe.com)
- [ ] QBO credentials (coordinate with Jered)

### For Maintenance Flow (Week 2)
- [ ] Asana personal access token
- [ ] Asana workspace ID
- [ ] Asana project ID

---

## 🧪 Testing Checklist

### Current Features (Test After Setup)
- [ ] Sign up creates account and profile
- [ ] Login redirects to dashboard
- [ ] Dashboard shows user's name and unit
- [ ] Sign out works
- [ ] Unauthenticated users redirected to login
- [ ] Recent payments widget shows "No payments yet"
- [ ] Open requests widget shows "No open requests"

### Payment Flow (Test After Implementation)
- [ ] Balance displays correctly from QBO
- [ ] Payment form accepts test card
- [ ] Payment succeeds with Stripe test card
- [ ] Payment record saved to database
- [ ] Payment posted to QBO
- [ ] Success page shows after payment
- [ ] Payment appears in history

---

## 🐛 Common Issues & Solutions

### "Invalid API key"
→ Check `.env.local` has correct Supabase keys  
→ Restart dev server after editing `.env.local`

### "relation 'profiles' does not exist"
→ Run `supabase/schema.sql` in Supabase SQL Editor

### "User not found" after signup
→ Check if profile was created: `SELECT * FROM profiles`  
→ Verify RLS policies allow insert

### Build fails with TypeScript errors
→ Run `npm run build` to see all errors  
→ Check that types in `lib/types/database.ts` match schema

### Dashboard shows "No unit"
→ Create test unit with your user ID:
```sql
INSERT INTO units (property_id, unit_number, tenant_id)
VALUES ('<property-id>', '101', '<your-user-id>');
```

---

## 💡 Tips for Next Developer

### Hot Tips
1. **Start dev server once, leave it running** - Next.js hot reload is fast
2. **Use TypeScript IntelliSense** - Types auto-complete everything
3. **Check browser console** - Errors show there first
4. **Use Supabase Table Editor** - Easiest way to inspect data
5. **Test with multiple accounts** - Create tenant1@test.com, tenant2@test.com

### VS Code Extensions (Recommended)
- ESLint
- Tailwind CSS IntelliSense
- Prettier
- Thunder Client (API testing)

### Useful Commands
```bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm start               # Start production server

# Type checking
npx tsc --noEmit        # Check types without building

# Database
# (Use Supabase dashboard SQL Editor)
```

---

## 📞 Questions? Check These First

1. **How do I...?** → Check README.md
2. **Setup not working?** → Check SETUP_GUIDE.md
3. **What's next to build?** → Check PROJECT_STATUS.md
4. **Why did we use X?** → Check TECH_STACK.md
5. **What's done?** → Check PHASE1_WEEK1_REPORT.md

---

## 🎯 Success Criteria for Week 1

Week 1 is "done" when:
- [ ] Tenant can view current rent balance
- [ ] Tenant can pay rent with credit card
- [ ] Payment is recorded in database
- [ ] Payment is posted to QuickBooks
- [ ] Tenant can see payment history

**Current status:** Setup complete, ready to build payment flow

---

## 🚀 Ready to Start?

```bash
cd /home/ubuntu/clawd/tenant-portal
npm run dev
# Open http://localhost:3000
# Read SETUP_GUIDE.md
# Create Supabase project
# Start building!
```

---

**Good luck! The foundation is solid.** 🎉
