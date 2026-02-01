# Tenant Portal - Setup Guide

This guide walks you through setting up the tenant portal from scratch.

## 🎯 Quick Start (TL;DR)

```bash
# 1. Install dependencies
cd tenant-portal
npm install

# 2. Set up Supabase (see Supabase Setup section)
# 3. Configure .env.local with your Supabase keys
# 4. Run development server
npm run dev
```

---

## 📋 Detailed Setup

### 1. Supabase Setup

#### Create Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name:** tenant-portal-dev (or whatever you prefer)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free (sufficient for development)
4. Click "Create new project" and wait ~2 minutes

#### Get API Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** Long string starting with `eyJ...`
   - **service_role key:** Long string starting with `eyJ...` (keep this secret!)

#### Run Database Schema

1. In Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **New query**
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Paste into the SQL editor
5. Click **Run** (bottom right)
6. You should see "Success. No rows returned" - that's good!

#### Verify Tables

1. Click **Table Editor** in sidebar
2. You should see these tables:
   - profiles
   - properties
   - units
   - payments
   - maintenance_requests
   - maintenance_photos
   - messages
   - announcements

#### Configure Auth

1. Go to **Authentication** > **Providers**
2. Ensure **Email** is enabled (it should be by default)
3. Optional: Configure email templates for password reset, etc.

#### Set Up Storage (for maintenance photos)

1. Go to **Storage** in sidebar
2. Click **Create bucket**
3. Name: `maintenance-photos`
4. Public bucket: **Yes** (or configure RLS if you want more control)
5. Click **Create bucket**

---

### 2. Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and replace the Supabase placeholders:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=eyJhb...your-service-role-key
   ```

3. Leave the other placeholders for now (Stripe, QBO, Asana) - we'll fill those in later

---

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should be redirected to the login page.

---

### 4. Create Test Data

#### Create a Test Tenant Account

1. Go to [http://localhost:3000/signup](http://localhost:3000/signup)
2. Fill in:
   - **Name:** Test Tenant
   - **Email:** test@example.com
   - **Password:** password123
3. Click **Sign up**
4. You should be redirected to the dashboard

#### Create Test Property & Unit

Since you just signed up, you don't have a unit assigned yet. Let's create one:

1. Go to Supabase dashboard > **SQL Editor**
2. Run this query (replace `<user-id>` with your test user's ID):

```sql
-- First, get your user ID
SELECT id, email FROM auth.users WHERE email = 'test@example.com';

-- Create a test property
INSERT INTO properties (name, address) 
VALUES ('Riverside Apartments', '123 Main Street, Anytown, USA')
RETURNING id;

-- Create a test unit (replace <property-id> and <user-id> with the IDs from above)
INSERT INTO units (property_id, unit_number, tenant_id, monthly_rent, lease_start_date, lease_end_date)
VALUES (
  '<property-id>', 
  '101', 
  '<user-id>', 
  1200.00,
  '2024-01-01',
  '2024-12-31'
);
```

3. Refresh your dashboard - you should now see "Riverside Apartments - Unit 101"

---

### 5. Verify Everything Works

#### Test Authentication
- [x] Sign up creates a new user
- [x] Login works with email/password
- [x] Dashboard shows user's name
- [x] Sign out works

#### Test Dashboard
- [x] Dashboard displays property and unit info
- [x] "Pay Rent" card is visible
- [x] "Maintenance Request" card is visible
- [x] Recent payments widget shows "No payments yet"
- [x] Open requests widget shows "No open requests"

---

## 🔧 Next Steps

### Before Week 1 Work

1. **Get Stripe API keys**
   - Sign up at [https://stripe.com](https://stripe.com)
   - Get test mode API keys (Dashboard > Developers > API keys)
   - Add to `.env.local`:
     ```env
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
     STRIPE_SECRET_KEY=sk_test_...
     ```

2. **Get QuickBooks API credentials** (optional for now, needed for balance fetch)
   - Sign in to QuickBooks Developer portal
   - Create an app
   - Get Client ID and Secret
   - Set up OAuth (will need help from Jered)

3. **Get Asana API token** (needed for Week 2)
   - Sign in to Asana
   - Go to Personal Access Token settings
   - Create a new token
   - Get your workspace ID and create a "Maintenance Requests" project

---

## 🐛 Troubleshooting

### "Invalid API key" error
- Double-check your Supabase URL and keys in `.env.local`
- Make sure you copied the **anon public** key, not the service role key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "relation 'profiles' does not exist"
- Run the schema.sql file in Supabase SQL Editor
- Make sure it completed without errors

### Sign up doesn't work
- Check browser console for errors
- Verify email authentication is enabled in Supabase (Authentication > Providers)

### Dashboard shows "No unit" after creating one
- Make sure you used the correct user ID (from `auth.users`, not a random UUID)
- Try refreshing the page or logging out and back in

### Build errors
```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run build
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## ✅ Setup Complete!

You now have:
- ✅ A working Next.js app
- ✅ Supabase database with schema
- ✅ Authentication (signup/login/logout)
- ✅ Dashboard page
- ✅ Test tenant account with a unit

Ready to start building the payment flow! 🎉
