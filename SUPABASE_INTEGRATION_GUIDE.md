# Supabase Backend Integration Guide

## Overview

ContractorAI is fully integrated with Supabase for authentication, database persistence, file storage, and real-time features. All data is stored in a PostgreSQL database with Row Level Security (RLS) enabled.

## ✅ Completed Setup

### 1. **Database Schema**

All tables created with proper relationships and indexes:

- **contractor_profiles** - User business profiles
- **customers** - Customer contact information
- **jobs** - Job tracking and proposals
- **invoices** - Invoice management
- **invoice_items** - Line items for invoices
- **activities** - Activity feed/audit log
- **notifications** - In-app notifications
- **photos** - Job photo storage metadata
- **user_settings** - User preferences and settings

**Key Features:**
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Foreign key relationships with CASCADE delete
- Auto-updating `updated_at` timestamps
- Indexes for optimal query performance

### 2. **Authentication**

Location: `src/contexts/AuthContext.tsx`

**Features:**
- Email/password authentication
- Automatic session management
- Profile creation on signup
- Remember me functionality
- Password reset
- Auth state persistence

**Usage:**
```typescript
const { user, profile, signIn, signUp, signOut } = useAuth();

// Sign up
await signUp(email, password, {
  business_name: "ABC Contractors",
  owner_name: "John Doe",
  phone_number: "(555) 123-4567"
});

// Sign in
await signIn(email, password, rememberMe);

// Sign out
await signOut();
```

### 3. **API Layer**

Location: `src/lib/api.ts`

Comprehensive CRUD operations for all entities:

**Customers API:**
```typescript
import { customersAPI } from './lib/api';

// Get all customers
const customers = await customersAPI.getAll();

// Create customer
const newCustomer = await customersAPI.create({
  name: "John Smith",
  email: "john@example.com",
  phone: "(555) 123-4567",
  address: "123 Main St"
});

// Update customer
await customersAPI.update(id, { phone: "(555) 999-8888" });

// Delete customer
await customersAPI.delete(id);
```

**Jobs API:**
```typescript
import { jobsAPI } from './lib/api';

// Get all jobs with customer info
const jobs = await jobsAPI.getAll();

// Create job
const newJob = await jobsAPI.create({
  customer_id: customerId,
  title: "Kitchen Remodel",
  description: "Full kitchen renovation",
  status: "draft",
  price: 5000
});

// Update job status
await jobsAPI.update(jobId, {
  status: "signed",
  signed_at: new Date().toISOString()
});
```

**Invoices API:**
```typescript
import { invoicesAPI } from './lib/api';

// Get all invoices with related data
const invoices = await invoicesAPI.getAll();

// Create invoice with items
const invoice = await invoicesAPI.create({
  customer_id: customerId,
  job_id: jobId,
  invoice_number: "INV-1001",
  subtotal: 5000,
  tax: 412.50,
  total: 5412.50,
  due_date: "2025-11-01",
  status: "sent"
});

// Add line items
await invoicesAPI.createItems([
  {
    invoice_id: invoice.id,
    description: "Labor",
    quantity: 40,
    unit_price: 75,
    amount: 3000
  }
]);
```

### 4. **Data Context**

Location: `src/contexts/DataContext.tsx`

Centralized data management with automatic loading:

**Usage:**
```typescript
const {
  customers,
  jobs,
  invoices,
  activities,
  notifications,
  unreadCount,
  isLoading,
  refreshData,
  createCustomer,
  updateJob,
  // ... all CRUD methods
} = useData();
```

**Features:**
- Automatic data loading on auth
- Optimistic updates
- Error handling with toast notifications
- Helper methods for relationships

### 5. **File Storage**

Location: `src/lib/storage.ts`

Photo upload and management for jobs:

**Usage:**
```typescript
import { uploadPhoto, getJobPhotos, deletePhoto } from './lib/storage';

// Upload single photo
const result = await uploadPhoto(file, jobId, "Before photo");

// Upload multiple photos
const results = await uploadMultiplePhotos(files, jobId);

// Get all photos for a job
const photos = await getJobPhotos(jobId);

// Delete photo
await deletePhoto(photoId);
```

**Storage Setup:**
1. Bucket name: `job-photos`
2. Public access enabled for viewing
3. File size limit: 10MB
4. Automatic URL generation

### 6. **Real-time Subscriptions**

Location: `src/lib/realtime.ts`

Live updates when data changes:

**Usage:**
```typescript
import { subscribeToJobs, subscribeToNotifications } from './lib/realtime';

// Subscribe to job changes
useEffect(() => {
  const unsubscribe = subscribeToJobs((payload) => {
    if (payload.eventType === 'INSERT') {
      console.log('New job created:', payload.new);
    } else if (payload.eventType === 'UPDATE') {
      console.log('Job updated:', payload.new);
    }
  });

  return unsubscribe;
}, []);

// Subscribe to notifications
useEffect(() => {
  const unsubscribe = subscribeToNotifications((payload) => {
    if (payload.eventType === 'INSERT') {
      showToast(payload.new.title, 'info');
    }
  });

  return unsubscribe;
}, []);
```

**Available Subscriptions:**
- `subscribeToJobs(callback)`
- `subscribeToCustomers(callback)`
- `subscribeToInvoices(callback)`
- `subscribeToActivities(callback)`
- `subscribeToNotifications(callback)`
- `subscribeToJobUpdates(jobId, callback)`

### 7. **Seed Data**

Location: `src/lib/seedData.ts`

Generates sample data for testing:

**Usage:**
```typescript
import { seedDatabase } from './lib/seedData';

// Seed database with sample data
const success = await seedDatabase(userId);
```

**Generates:**
- 20 customers with realistic data
- 30 jobs with various statuses
- Invoices for completed jobs
- Invoice line items
- 20+ activity entries
- 4 sample notifications

### 8. **Analytics Service**

Location: `src/lib/analyticsService.ts`

Business intelligence and reporting:

**Features:**
- Total revenue calculations
- Jobs completed tracking
- Win rate analysis
- Average job value
- Monthly revenue trends
- Proposal pipeline analytics
- Job status breakdown
- Revenue by job type
- AI-powered insights

**Usage:**
```typescript
import { analyticsService } from './lib/analyticsService';

// Get key metrics
const revenue = await analyticsService.calculateTotalRevenue(startDate, endDate);
const winRate = await analyticsService.calculateWinRate(startDate, endDate);

// Get trends
const monthlyData = await analyticsService.calculateMonthlyRevenue(12);

// Get insights
const insights = await analyticsService.generateAIInsights(startDate, endDate);
```

## Environment Variables

Required in `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Database Migrations

Migrations are located in `supabase/migrations/`:

1. **20251016205540_create_contractor_profiles.sql** - Initial profile table
2. **20251016221103_create_full_schema.sql** - All core tables
3. **20251017000000_add_analytics_fields.sql** - Analytics tracking fields

To apply migrations manually (if needed):
```bash
# Using Supabase CLI
supabase db push

# Or apply via SQL Editor in Supabase Dashboard
```

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies:

```sql
-- Example: Jobs table policies
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### Data Isolation

- Each user can only access their own data
- Foreign keys enforce referential integrity
- CASCADE deletes remove related records
- Indexes optimize query performance

## Best Practices

### 1. Error Handling

Always handle errors properly:

```typescript
try {
  const customer = await customersAPI.create(data);
  showToast('Customer created successfully', 'success');
} catch (error) {
  console.error('Failed to create customer:', error);
  showToast('Failed to create customer', 'error');
}
```

### 2. Loading States

Show loading indicators during async operations:

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await jobsAPI.create(jobData);
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Real-time Cleanup

Always unsubscribe from real-time channels:

```typescript
useEffect(() => {
  const unsubscribe = subscribeToJobs(handleJobUpdate);
  return () => unsubscribe(); // Cleanup on unmount
}, []);
```

### 4. Data Freshness

Refresh data after mutations:

```typescript
const { refreshData } = useData();

const createJob = async (jobData) => {
  await jobsAPI.create(jobData);
  await refreshData(); // Refresh to get latest data
};
```

## Troubleshooting

### Authentication Issues

**Problem:** User can't sign in
**Solution:** Check Supabase dashboard for auth logs

**Problem:** Profile not loading
**Solution:** Verify contractor_profiles table has data

### Data Not Showing

**Problem:** Empty lists after login
**Solution:**
1. Check RLS policies are correct
2. Verify user_id matches auth.uid()
3. Use seed data to populate database

### Real-time Not Working

**Problem:** No live updates
**Solution:**
1. Ensure realtime is enabled in Supabase project settings
2. Check subscription filters match user_id
3. Verify callback functions are working

## Next Steps

### Optional Enhancements

1. **Email Notifications**
   - Set up Supabase Edge Functions for email
   - Use SendGrid or Resend for delivery

2. **File Upload Progress**
   - Add progress bars for photo uploads
   - Show upload status in UI

3. **Offline Support**
   - Cache data in IndexedDB
   - Queue mutations for sync when online

4. **Advanced Analytics**
   - Add more complex queries
   - Create custom reports
   - Export data to CSV/PDF

## Support

For issues or questions:
1. Check Supabase logs in dashboard
2. Review migration files
3. Test queries in SQL Editor
4. Check browser console for errors

## Summary

✅ Full Supabase integration complete
✅ All data persisted to PostgreSQL
✅ Authentication with profiles
✅ CRUD operations for all entities
✅ File storage for photos
✅ Real-time subscriptions
✅ Analytics and reporting
✅ Seed data for testing
✅ Row Level Security enabled
✅ Production-ready backend

The app is now using a real database with all features fully operational!
