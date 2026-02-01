# Tenant Portal - MVP Phase 1

Custom tenant portal built with Next.js 14+, Supabase, and Stripe to replace Buildium for rent collection and maintenance requests.

## 🎯 Phase 1 Goals (Weeks 1-3)

- ✅ Next.js app with TypeScript and Tailwind CSS
- ✅ Supabase authentication (email/password)
- ✅ Database schema with RLS policies
- ⏳ Rent payment flow (Stripe integration)
- ⏳ Maintenance request flow (Asana integration)
- ⏳ Dashboard with overview
- ⏳ Deploy to Vercel staging

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Stripe account (test mode)
- QuickBooks Online account with API access
- Asana account with API access
- Vercel account (for deployment)

## 🚀 Getting Started

### 1. Clone and Install

```bash
cd tenant-portal
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. In the Supabase SQL Editor, run the schema from `supabase/schema.sql`

### 3. Set Up Stripe

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Get your test API keys from Dashboard > Developers > API keys
3. Note: Webhook setup will come later when we deploy

### 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Update the following:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (Settings > API)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_SECRET_KEY`: Your Stripe secret key

*QBO and Asana keys will be added when we implement those integrations*

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
tenant-portal/
├── app/                          # Next.js 14 app directory
│   ├── dashboard/               # Tenant dashboard
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── payments/                # Payment flow (TBD)
│   ├── maintenance/             # Maintenance requests (TBD)
│   └── layout.tsx              # Root layout
├── lib/
│   ├── supabase/               # Supabase client utilities
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── middleware.ts       # Auth middleware
│   └── types/
│       └── database.ts         # TypeScript types
├── supabase/
│   └── schema.sql              # Database schema
├── middleware.ts               # Next.js middleware for auth
└── .env.local                  # Environment variables
```

## 🔐 Authentication Flow

1. User signs up at `/signup` → Creates auth.users entry + profiles row
2. Supabase sends confirmation email (if email confirmation enabled)
3. User logs in at `/login` → Sets auth cookie
4. Middleware checks auth on all routes except `/login` and `/signup`
5. Protected routes redirect to `/login` if not authenticated

## 🗄️ Database Schema

See `supabase/schema.sql` for the complete schema. Key tables:

- `profiles`: User profiles (extends auth.users)
- `properties`: Property information
- `units`: Individual rental units
- `payments`: Payment records
- `maintenance_requests`: Maintenance tickets
- `maintenance_photos`: Photos attached to requests

## 🔄 Next Steps

### Week 1 Remaining Tasks:
- [ ] Implement payment flow UI
- [ ] Integrate Stripe payment intent API
- [ ] Connect to QBO API for balance fetching
- [ ] Create payment history page

### Week 2 Tasks:
- [ ] Implement maintenance request form
- [ ] Integrate Asana API for task creation
- [ ] Add photo upload (Supabase storage)
- [ ] Create maintenance request list/detail pages
- [ ] Set up Asana webhooks for status sync

### Week 3 Tasks:
- [ ] Polish UI/UX
- [ ] Add loading states and error handling
- [ ] Write basic tests
- [ ] Deploy to Vercel staging
- [ ] Test with 1-2 mock tenant accounts
- [ ] Document setup process

## 🧪 Testing

### Create Test Tenant Account

1. Sign up at `/signup`
2. In Supabase, create a test property and unit:

```sql
-- Insert test property
INSERT INTO properties (name, address) 
VALUES ('Test Property', '123 Main St');

-- Insert test unit (replace property_id and tenant_id)
INSERT INTO units (property_id, unit_number, tenant_id, monthly_rent)
VALUES ('<property-uuid>', '101', '<user-uuid>', 1200.00);
```

## 🚢 Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Supabase

Production database:
1. Create production Supabase project
2. Run schema.sql in production SQL editor
3. Update production environment variables

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Asana API Docs](https://developers.asana.com/docs)
- [QuickBooks API Docs](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/invoice)

## 🐛 Known Issues

- None yet (this is MVP!)

## 📝 License

Private project - not licensed for public use.

## 🤝 Contributing

This is an internal project. For questions or issues, contact Jered2.0.
