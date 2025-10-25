# Production Cleanup Required

## CRITICAL: Mock Data Removal Status

### ⚠️ Files Containing Mock Data (MUST BE FIXED BEFORE LAUNCH)

The following pages are currently using hardcoded mock data instead of real database queries:

1. **src/pages/CustomersPage.tsx**
   - Currently imports: `import { mockCustomers } from '../data/mockCustomers'`
   - **Action Required**: Update to use `const { customers } = useData()` from DataContext
   - The mock Customer type has fields not in the database schema (firstName, lastName, totalRevenue, etc.)
   - Database schema only has: id, user_id, name, email, phone, address, city, state, zip, notes
   - **You MUST either:**
     - A) Update database schema to match mock data fields, OR
     - B) Simplify the CustomersPage UI to only use available database fields

2. **src/pages/JobsPage.tsx**
   - Currently imports: `import { mockJobs } from '../data/mockJobs'`
   - **Action Required**: Update to use `const { jobs } = useData()` from DataContext

3. **src/pages/InvoicesPage.tsx**
   - Currently imports: `import { mockInvoices } from '../data/mockInvoices'`
   - **Action Required**: Update to use `const { invoices } = useData()` from DataContext

### Mock Data Files to Delete

- ✅ `src/data/mockCustomers.ts` - Delete this file
- ✅ `src/data/mockJobs.ts` - Delete this file
- ✅ `src/data/mockInvoices.ts` - Delete this file

### How to Fix Each Page

#### Example: CustomersPage.tsx

**Before (Mock Data):**
```typescript
import { mockCustomers } from '../data/mockCustomers';

export default function CustomersPage() {
  const customers = mockCustomers; // ❌ Wrong!
  // ...
}
```

**After (Real Database):**
```typescript
import { useData } from '../contexts/DataContext';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CustomersPage() {
  const { customers, isLoading } = useData(); // ✅ Correct!

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  if (customers.length === 0) {
    return (
      <DashboardLayout>
        <EmptyState
          icon={<Users className="w-16 h-16" />}
          title="No customers yet"
          description="Add your first customer to get started"
          action={{
            label: "Add Customer",
            onClick: () => setShowAddModal(true)
          }}
        />
      </DashboardLayout>
    );
  }

  // Render customers list...
}
```

## Schema Mismatch Issues

### Mock Customer Type vs Database Customer Type

**Mock Type** (src/data/mockCustomers.ts):
- firstName, lastName (separated)
- totalJobs, totalRevenue, averageJobValue (calculated)
- outstandingBalance (calculated)
- lastJobDate, lastContactDate (calculated)
- activities[] (array of activity objects)
- communications[] (array of communication objects)
- tags[], preferredContact, referredBy

**Database Type** (src/lib/api.ts):
- name (single field - not firstName/lastName)
- NO calculated fields
- NO embedded arrays

### Solutions:

**Option A: Add fields to database**
Run this migration:
```sql
ALTER TABLE customers ADD COLUMN first_name TEXT;
ALTER TABLE customers ADD COLUMN last_name TEXT;
ALTER TABLE customers ADD COLUMN preferred_contact TEXT;
ALTER TABLE customers ADD COLUMN referred_by TEXT;
ALTER TABLE customers ADD COLUMN tags TEXT[]; -- array

-- For calculated fields, create database views or functions
CREATE VIEW customer_stats AS
SELECT
  c.id,
  c.name,
  COUNT(j.id) as total_jobs,
  COALESCE(SUM(j.price), 0) as total_revenue,
  MAX(j.created_at) as last_job_date
FROM customers c
LEFT JOIN jobs j ON j.customer_id = c.id
GROUP BY c.id;
```

**Option B: Simplify UI**
Remove features that require fields not in database:
- Remove "Total Revenue" display
- Remove "Last Job" display
- Remove activity timeline
- Remove communications history
- Keep it simple: Just show name, phone, email, address

**Recommended: Option A** - Add the fields to make the app feature-complete.

## Other Production Issues

### 1. Console.log Statements
Search and remove:
```bash
grep -r "console.log" src/
grep -r "console.table" src/
grep -r "console.error" src/ # Keep these but wrap in error handler
```

### 2. Development Delays
In `src/lib/api.ts`:
```typescript
const SIMULATE_DELAY = true; // ❌ Set to FALSE in production
```

### 3. Demo User Logic
Search for and remove:
```bash
grep -r "demo@example.com" src/
grep -r "test@test.com" src/
```

### 4. Environment Variables
Ensure `.env.production` has LIVE keys:
- ✅ VITE_SUPABASE_URL (production Supabase)
- ✅ VITE_SUPABASE_ANON_KEY (production Supabase)
- ❌ Stripe sk_test_* → sk_live_*
- ❌ Twilio test credentials → live credentials
- ❌ OpenAI test key → production key

## Testing Checklist

Before launch, test with REAL account:

- [ ] Sign up with real email
- [ ] Create real customer (not mock data)
- [ ] Create real job (not mock data)
- [ ] Create real invoice (not mock data)
- [ ] Verify CustomersPage shows YOUR data
- [ ] Verify JobsPage shows YOUR data
- [ ] Verify InvoicesPage shows YOUR data
- [ ] Verify Reports page calculates from YOUR data
- [ ] Delete test account before launch

## Database Cleanup

Before launch, run this in Supabase SQL Editor:

```sql
-- Delete all test data
DELETE FROM activities WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%'
);

DELETE FROM photos WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%'
);

DELETE FROM invoice_items WHERE invoice_id IN (
  SELECT id FROM invoices WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%'
  )
);

DELETE FROM invoices WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%'
);

DELETE FROM jobs WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%'
);

DELETE FROM customers WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%'
);

DELETE FROM contractor_profiles WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%';

-- Delete from auth.users in Supabase Auth Dashboard manually
```

## Ready for Production Criteria

✅ All mock data files deleted
✅ All pages use useData() hook
✅ Empty states work correctly
✅ No console.log statements
✅ SIMULATE_DELAY = false
✅ All .env variables are LIVE (not test)
✅ Stripe in live mode
✅ Database cleaned of test data
✅ Tested with real account
✅ Real account deleted before launch

---

**CURRENT STATUS**: ⚠️ NOT PRODUCTION READY

The app still has mock data in 3 pages. These MUST be fixed before real users can use the app.
