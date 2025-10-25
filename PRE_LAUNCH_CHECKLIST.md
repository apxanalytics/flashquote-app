# Pre-Launch Checklist for ContractorAI

## ✅ COMPLETED

### Code Cleanup
- ✅ Removed DataModeContext and sample data seeding
- ✅ Disabled SIMULATE_DELAY in api.ts (production performance)
- ✅ Removed seed data functionality from SettingsPage
- ✅ Build passes successfully (no errors)

### Documentation Created
- ✅ `PRODUCTION_CLEANUP_REQUIRED.md` - Lists all remaining mock data issues
- ✅ `cleanup_test_data.sql` - SQL script to clean database before launch
- ✅ `.env.production.template` - Template for production environment variables

---

## ⚠️ CRITICAL: NOT YET PRODUCTION READY

The following **MUST** be completed before launching to real users:

### 1. Mock Data Still Present (CRITICAL!)

Three pages still use hardcoded mock data instead of database queries:

#### src/pages/CustomersPage.tsx
**Current:**
```typescript
import { mockCustomers } from '../data/mockCustomers';
const customers = mockCustomers; // ❌ WRONG
```

**Required Fix:**
```typescript
import { useData } from '../contexts/DataContext';
const { customers, isLoading } = useData(); // ✅ CORRECT
```

**Issue:** Mock customer type has fields not in database schema:
- Mock has: firstName, lastName, totalRevenue, activities[], communications[]
- Database has: name, email, phone, address (basic fields only)

**Solutions:**
1. **Option A (Recommended):** Add missing fields to database schema
2. **Option B:** Simplify UI to use only available fields

#### src/pages/JobsPage.tsx
- ❌ Currently uses `import { mockJobs } from '../data/mockJobs'`
- ✅ Must use: `const { jobs } = useData()`

#### src/pages/InvoicesPage.tsx
- ❌ Currently uses `import { mockInvoices } from '../data/mockInvoices'`
- ✅ Must use: `const { invoices } = useData()`

**Action:** Delete mock data files:
```bash
rm src/data/mockCustomers.ts
rm src/data/mockJobs.ts
rm src/data/mockInvoices.ts
```

Then update all three pages to use `useData()` hook.

---

### 2. Database Schema Updates (If keeping full UI)

If you want to keep all the features in CustomersPage, add these fields:

```sql
-- Run in Supabase SQL Editor
ALTER TABLE customers
  ADD COLUMN first_name TEXT,
  ADD COLUMN last_name TEXT,
  ADD COLUMN business_name TEXT,
  ADD COLUMN preferred_contact TEXT CHECK (preferred_contact IN ('phone', 'email', 'text')),
  ADD COLUMN referred_by TEXT,
  ADD COLUMN tags TEXT[] DEFAULT '{}',
  ADD COLUMN customer_since TIMESTAMPTZ DEFAULT now();

-- Create view for calculated stats
CREATE VIEW customer_stats AS
SELECT
  c.id,
  c.name,
  c.email,
  c.phone,
  COUNT(DISTINCT j.id) as total_jobs,
  COALESCE(SUM(j.price), 0) as total_revenue,
  COALESCE(AVG(j.price), 0) as average_job_value,
  COALESCE(SUM(CASE WHEN i.status != 'paid' THEN i.total - COALESCE(i.subtotal, 0) ELSE 0 END), 0) as outstanding_balance,
  MAX(j.created_at) as last_job_date,
  MAX(c.updated_at) as last_contact_date
FROM customers c
LEFT JOIN jobs j ON j.customer_id = c.id
LEFT JOIN invoices i ON i.customer_id = c.id
GROUP BY c.id, c.name, c.email, c.phone;
```

---

### 3. Environment Variables

#### Development (.env)
Currently using TEST credentials (this is OK for dev):
```bash
STRIPE_SECRET_KEY=sk_test_...
TWILIO_PHONE_NUMBER=+1555... (test number)
```

#### Production (.env.production)
**MUST switch to LIVE credentials:**

```bash
# Supabase Production
VITE_SUPABASE_URL=https://YOUR-PROD-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (production key)

# Stripe LIVE mode
STRIPE_SECRET_KEY=sk_live_51... (NOT sk_test!)
STRIPE_PUBLISHABLE_KEY=pk_live_... (NOT pk_test!)

# Twilio Production
TWILIO_PHONE_NUMBER=+1... (real number, not test)
TWILIO_ACCOUNT_SID=AC... (production account)

# OpenAI Production
OPENAI_API_KEY=sk-proj-... (with appropriate rate limits)

# Resend Production
RESEND_API_KEY=re_... (production key)
```

**Stripe Important:**
1. Log into Stripe Dashboard
2. Toggle from "Test Mode" to "Live Mode" (top right)
3. Get new API keys
4. Update webhook endpoints to point to production domain
5. Test with real card (your own)
6. Immediately refund test transaction

---

### 4. Database Cleanup

Before launch, clean all test data:

```bash
# 1. Review test users
# Run Step 1 from cleanup_test_data.sql

# 2. Run deletion script
# Run Step 3 from cleanup_test_data.sql

# 3. Delete auth users manually
# Supabase Dashboard > Authentication > Users > Delete test users

# 4. Verify empty database
# Run Step 5 from cleanup_test_data.sql
```

---

### 5. Code Cleanup

#### Remove Console.logs
```bash
# Search for console statements
grep -r "console.log" src/
grep -r "console.table" src/

# Keep console.error but wrap in error boundary
# Remove all console.log and console.table
```

#### Found in these files:
- src/lib/voiceRecording.ts
- src/lib/realtimeHelpers.ts
- src/lib/stripe.ts
- src/components/AIChatButton.tsx

**Action:** Review each file and remove debug console.logs

---

### 6. Testing with Real Account

Create a fresh account and test EVERYTHING:

```
Manual Test Checklist:
□ Sign up with real email address
□ Receive confirmation email
□ Complete onboarding flow
□ Add first real customer
□ Record voice for job
□ Verify Whisper transcription works
□ Upload photos
□ Generate AI proposal
□ Send proposal via SMS (to your phone)
□ Send proposal via email (to your email)
□ Open proposal on mobile device
□ Sign proposal
□ Mark job as complete
□ Create invoice
□ Send invoice
□ Pay invoice with real credit card
□ Verify payment in Stripe dashboard
□ Verify payment status updated in app
□ Check all emails arrived
□ Check all SMS arrived
□ Test on iPhone Safari
□ Test on Android Chrome
□ Test on desktop browsers
□ Check reports show correct data
□ Verify no mock data visible
□ Test offline functionality (PWA)
□ Test PWA installation
□ Verify all empty states work
□ Test error handling (bad network, etc.)
```

After testing:
```
□ Delete test account data
□ Run cleanup_test_data.sql
□ Start fresh for first real user
```

---

### 7. Deployment Configuration

#### Vercel Dashboard
Set all environment variables in Vercel:
```
Settings > Environment Variables

Add for "Production":
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- All other variables from .env.production.template
```

#### Domain & SSL
```
□ Custom domain configured
□ SSL certificate active (https://)
□ Redirects configured (www → non-www or vice versa)
□ DNS propagated (check with https://dnschecker.org)
```

#### Webhooks
Update webhook URLs to production domain:
```
Stripe Webhooks:
https://YOUR-DOMAIN.com/api/stripe-webhook

Twilio Webhooks (if used):
https://YOUR-DOMAIN.com/api/twilio-webhook
```

---

### 8. Monitoring & Analytics

#### Error Tracking (Recommended)
Install Sentry:
```bash
npm install @sentry/react
```

Configure in src/main.tsx:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://...@sentry.io/...",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

#### Analytics (Optional)
- Vercel Analytics (automatic on Vercel)
- Google Analytics (add to index.html)
- PostHog (product analytics)

---

### 9. Backup Plan

Before launch:
```
□ Supabase automatic backups enabled
□ Database export downloaded locally
□ Code pushed to private GitHub repo
□ Environment variables backed up (secure location)
□ Stripe keys documented (password manager)
□ API credentials stored securely
```

---

### 10. Launch Day

```
□ Final git commit: "Production ready - v1.0"
□ Deploy to Vercel
□ Verify production build works
□ Run final test with real account
□ Delete test account
□ Monitor Sentry for errors
□ Monitor Vercel analytics
□ Watch for first real signup
□ Be available for support
□ Celebrate! 🎉
```

---

## Current Status

### ✅ Ready
- Build system
- Authentication
- Database migrations
- Edge functions
- Payment processing
- Email/SMS integration
- PWA functionality
- Error boundaries
- Offline support

### ⚠️ Not Ready
- **CustomersPage** (uses mock data)
- **JobsPage** (uses mock data)
- **InvoicesPage** (uses mock data)
- Console.log cleanup
- Environment variables switch
- Database cleanup
- Real account testing

---

## Estimated Time to Production Ready

- **Fix mock data pages:** 2-4 hours
- **Database schema updates:** 1 hour
- **Console.log cleanup:** 30 minutes
- **Environment variable setup:** 30 minutes
- **Database cleanup:** 15 minutes
- **Real account testing:** 2-3 hours
- **Total:** ~6-9 hours

---

## Priority Order

1. **High Priority (Must Fix):**
   - Remove mock data from 3 pages
   - Switch to production API keys
   - Clean database of test data

2. **Medium Priority (Should Fix):**
   - Remove console.logs
   - Add error monitoring
   - Update database schema (if keeping full UI)

3. **Low Priority (Nice to Have):**
   - Add analytics
   - Performance optimization
   - Code splitting

---

## Need Help?

See these files:
- `PRODUCTION_CLEANUP_REQUIRED.md` - Detailed mock data removal guide
- `cleanup_test_data.sql` - Database cleanup script
- `.env.production.template` - Environment variables template
- `DEPLOYMENT_GUIDE.md` - Vercel deployment guide

---

**Last Updated:** October 17, 2025
**Status:** ⚠️ NOT PRODUCTION READY (mock data removal required)
