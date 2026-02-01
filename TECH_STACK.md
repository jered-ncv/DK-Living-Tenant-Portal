# Tech Stack Documentation

Complete breakdown of technologies used and why.

---

## 🎨 Frontend

### Next.js 14+ (App Router)
**What:** React framework with server-side rendering  
**Why:**
- Modern app router with file-based routing
- Server components reduce client-side JavaScript
- Built-in API routes for backend logic
- Excellent DX with hot reload and TypeScript support
- Easy deployment on Vercel

**Alternatives considered:**
- ❌ Create React App (outdated, no SSR)
- ❌ Vite + React Router (more setup, no built-in SSR)
- ❌ Remix (good, but Next.js has larger ecosystem)

### TypeScript
**What:** JavaScript with static typing  
**Why:**
- Catch errors at compile time
- Better IDE autocomplete
- Self-documenting code
- Safer refactoring

### Tailwind CSS
**What:** Utility-first CSS framework  
**Why:**
- Rapid UI development
- Consistent design system
- Tiny production bundle (only used classes)
- No naming conventions needed
- Mobile-first responsive design

**Alternatives considered:**
- ❌ CSS Modules (more boilerplate)
- ❌ Styled Components (runtime cost)
- ❌ Bootstrap (too opinionated, larger bundle)

---

## 🗄️ Backend & Database

### Supabase
**What:** Open-source Firebase alternative (Postgres + Auth + Storage + Realtime)  
**Why:**
- **Database:** Full Postgres with all SQL features
- **Auth:** Built-in email/password + magic links + OAuth
- **Storage:** File uploads for maintenance photos
- **Real-time:** Optional WebSocket subscriptions
- **RLS:** Database-level security policies
- **Cost:** Free tier: 500MB DB, 1GB storage, 2GB bandwidth

**What we use:**
- Postgres database with custom schema
- Auth (email/password)
- Storage (maintenance photos - to be implemented)

**Alternatives considered:**
- ❌ Firebase: NoSQL limits, expensive, vendor lock-in
- ❌ PlanetScale: MySQL (less features than Postgres)
- ❌ Custom Postgres + Auth0: More setup, higher cost
- ❌ Clerk: Great auth but $0.02/user (adds up with 135 tenants)

### Row Level Security (RLS)
**What:** Postgres feature that enforces access control at the database level  
**Why:**
- Security even if app logic has bugs
- Tenants can only see their own data
- Admins/PMs can see all data
- No need for complex middleware

**Example policy:**
```sql
-- Tenants can only view their own payments
CREATE POLICY "Tenants can view own payments" ON payments
  FOR SELECT USING (tenant_id = auth.uid());
```

---

## 💳 Payment Processing

### Stripe
**What:** Payment processing API (credit cards, ACH, subscriptions)  
**Why:**
- Industry standard, trusted by millions
- Excellent API documentation
- Built-in fraud prevention
- PCI compliance handled for us
- Test mode for development
- **Cost:** 2.9% + $0.30 per transaction (cards), 0.8% (ACH, capped at $5)

**What we'll use:**
- Payment Intents API (one-time payments)
- Subscriptions API (autopay - Phase 2)
- Webhooks (payment confirmation)
- Customer API (save payment methods)

**Alternatives considered:**
- ❌ PayPal: Less developer-friendly API
- ❌ Square: Similar pricing, but Stripe has better docs
- ❌ Buildium's built-in: Expensive ($400/mo for API access)

---

## 🔗 Integrations

### QuickBooks Online (QBO) API
**What:** Accounting software API  
**Why:**
- Already used for accounting
- Fetch current rent balance
- Record payments automatically
- Single source of truth for financials

**What we'll use:**
- Customer API (tenant records)
- Invoice API (rent invoices)
- Payment API (record payments)
- OAuth 2.0 for authentication

**Complexity:** Medium (OAuth setup required)

### Asana API
**What:** Project management tool API  
**Why:**
- Already used for task management
- Free for small teams (<15 users)
- Mobile app for field team
- Good API documentation

**What we'll use:**
- Tasks API (create maintenance requests)
- Webhooks (sync status updates back to portal)
- Comments API (message thread on requests)

**Complexity:** Low (just need Personal Access Token)

---

## 🚀 Hosting & Deployment

### Vercel
**What:** Next.js hosting platform (made by the Next.js team)  
**Why:**
- Zero-config deployment
- Automatic HTTPS
- Built-in CI/CD (push to GitHub → auto-deploy)
- Serverless functions for API routes
- Edge network (fast globally)
- **Cost:** Free for hobby projects, $20/mo Pro if needed

**Alternatives considered:**
- ❌ Netlify: Good, but Vercel is optimized for Next.js
- ❌ AWS/EC2: Overkill, more ops work
- ❌ Heroku: Deprecated free tier

---

## 📦 Key Dependencies

### Core Framework
```json
{
  "next": "^16.1.6",           // Next.js framework
  "react": "^19.0.0",          // React library
  "react-dom": "^19.0.0"       // React DOM rendering
}
```

### Database & Auth
```json
{
  "@supabase/supabase-js": "^2.x",  // Supabase client
  "@supabase/ssr": "^0.x"           // SSR utilities for Next.js
}
```

### Payments
```json
{
  "stripe": "^latest",               // Stripe Node SDK
  "@stripe/stripe-js": "^latest"     // Stripe client SDK
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.x",         // Form state management
  "@hookform/resolvers": "^3.x",     // Form validation
  "zod": "^3.x"                      // Schema validation
}
```

### Utilities
```json
{
  "date-fns": "^3.x"                 // Date formatting
}
```

### Dev Dependencies
```json
{
  "typescript": "^5.x",              // TypeScript compiler
  "tailwindcss": "^4.x",             // CSS framework
  "eslint": "^9.x",                  // Code linter
  "@types/node": "^22.x",            // Node.js types
  "@types/react": "^19.x"            // React types
}
```

---

## 🔒 Security Stack

### Authentication
- Supabase Auth (JWT-based sessions)
- httpOnly cookies (not accessible via JavaScript)
- Automatic session refresh
- CSRF protection via Next.js

### Authorization
- Row Level Security (RLS) in database
- API route middleware checks user role
- Client-side route protection via middleware

### Data Protection
- All data encrypted at rest (Supabase default)
- HTTPS only (Vercel enforces)
- No PII stored (SSN, DOB remain in offline records)
- Payment data tokenized (Stripe handles card numbers)

### API Security
- Environment variables for secrets
- Rate limiting (to be implemented)
- Input validation with Zod schemas
- SQL injection prevention (parameterized queries)

---

## 📊 Performance Stack

### Frontend Optimization
- Server components (less JavaScript to client)
- Static page generation where possible
- Image optimization with next/image
- Code splitting (automatic with Next.js)
- Tailwind CSS purging (only used classes in production)

### Backend Optimization
- Database indexes on common queries
- Connection pooling (Supabase default)
- API route caching (to be implemented)
- Serverless functions (auto-scale)

### Monitoring (Future)
- Vercel Analytics (built-in)
- Sentry for error tracking (optional)
- Supabase dashboard for DB metrics

---

## 🧪 Testing Stack (Future)

Not implemented yet, but planned:

### Unit Testing
- **Jest** - Test runner
- **React Testing Library** - Component testing

### Integration Testing
- **Playwright** - E2E testing
- **MSW** - API mocking

### Manual Testing (Current)
- Test accounts in Supabase
- Stripe test cards
- QBO sandbox account

---

## 📱 Mobile Strategy

### Current: Mobile-Responsive Web
- Tailwind CSS mobile-first design
- Works on iOS/Android browsers
- Can be added to home screen (PWA)

### Future Options (if needed):
- Progressive Web App (PWA) features
- React Native app (reuse React skills)
- Expo for faster mobile development

---

## 🔄 API Architecture

### RESTful API Routes (Next.js)
```
/api/
  ├── payments/
  │   ├── create-intent     # POST - Create Stripe PaymentIntent
  │   ├── confirm           # POST - Confirm payment
  │   └── webhook           # POST - Stripe webhook handler
  ├── qbo/
  │   ├── balance           # GET - Fetch rent balance
  │   └── record-payment    # POST - Record payment in QBO
  ├── maintenance/
  │   ├── create            # POST - Create request + Asana task
  │   ├── upload-photo      # POST - Upload to Supabase storage
  │   └── list              # GET - List requests (with filters)
  └── asana/
      └── webhook           # POST - Receive Asana status updates
```

### Database Queries
- Direct Supabase client queries (server-side)
- RLS policies enforce access control
- TypeScript types for type safety

---

## 🎯 Design Decisions

### Why Server Components?
- Less JavaScript sent to browser
- SEO-friendly (rendered on server)
- Direct database access (no API middleman)

### Why File-Based Routing?
- Intuitive folder structure
- Automatic code splitting
- Colocation of route logic and UI

### Why RLS over API-Level Auth?
- Defense in depth (security at DB level)
- Simpler API routes (no auth middleware)
- Works even if we add other clients (mobile app, admin panel)

### Why Monorepo (Not Microservices)?
- Simpler deployment
- Shared types and utilities
- Faster development
- Sufficient for 135 users

---

## 💰 Cost Breakdown (Estimated)

### Monthly Fixed Costs
| Service | Plan | Cost |
|---------|------|------|
| Vercel | Free/Pro | $0-20 |
| Supabase | Free/Pro | $0-25 |
| **Total Fixed** | | **$0-45** |

### Variable Costs
| Service | Cost |
|---------|------|
| Stripe (payments) | 2.9% + $0.30 per transaction |
| Twilio (SMS, optional) | ~$0.0079 per SMS |

### Cost Comparison
- **Buildium Standard:** $62/mo (no API)
- **Buildium Premium:** $400/mo (with API)
- **Custom solution:** $0-45/mo + transaction fees
- **Annual savings:** ~$4,200-4,800

---

## 🚧 Future Tech Considerations

### Phase 2+ Additions
- **Redis/Upstash:** Caching for QBO balance queries
- **Resend/SendGrid:** Transactional emails
- **Twilio:** SMS notifications
- **Sentry:** Error monitoring
- **Posthog:** Analytics

### Scalability
Current stack handles:
- 500+ tenants (Supabase free tier)
- 10,000+ requests/day (Vercel free tier)
- If we outgrow: upgrade to paid tiers (~$50/mo total)

---

## 📚 Learning Resources

### For Next Developer
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)

### For Jered (Product Owner)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)

---

**Tech stack is modern, cost-effective, and scalable.** All choices optimize for speed of development and ease of maintenance. 🚀
