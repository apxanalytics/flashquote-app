# Supabase Backend Setup Guide

This application uses Supabase for authentication, database, storage, and real-time features. Most of the infrastructure is already configured, but you need to complete the setup steps below.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git installed

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in
4. Click "New Project"
5. Choose your organization
6. Enter project details:
   - **Name**: `flashquote` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (or paid if needed)
7. Click "Create new project"
8. Wait 2-3 minutes for project to provision

## Step 2: Get Your Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGc...`)

## Step 3: Configure Environment Variables

1. In your project root, create `.env.local` file:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Replace the values with your actual credentials from Step 2

3. **IMPORTANT**: Never commit `.env.local` to git (already in `.gitignore`)

## Step 4: Run Database Migrations

Your database schema is already defined in `supabase/migrations/` directory.

### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Apply all migrations
supabase db push
```

### Option B: Manual SQL Execution

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order:
   - `20251016205540_create_contractor_profiles.sql`
   - `20251016221103_create_full_schema.sql`
   - `20251017000000_add_analytics_fields.sql`
   - `20251017000001_add_stripe_integration.sql`
   - `20251017000002_add_communications_tracking.sql`
   - `20251017000003_add_support_system.sql`

4. Copy and paste the SQL from each file
5. Click "Run" for each migration
6. Verify "Success. No rows returned" message

## Step 5: Set Up Storage Buckets

### Create job-photos Bucket

1. Go to **Storage** in Supabase dashboard
2. Click "New bucket"
3. Enter details:
   - **Name**: `job-photos`
   - **Public bucket**: ✅ YES (so photos show in proposals)
   - **File size limit**: 50 MB
   - **Allowed MIME types**: `image/*`
4. Click "Create bucket"

### Configure Storage Policies

1. Click on `job-photos` bucket
2. Click "Policies" tab
3. Click "New Policy"
4. Click "For full customization"
5. Enter policy details:

**Policy name**: `Users can manage own photos`

**Allowed operations**: SELECT, INSERT, UPDATE, DELETE

**Policy definition (SELECT)**:
```sql
bucket_id = 'job-photos' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Policy definition (INSERT)**:
```sql
bucket_id = 'job-photos' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Policy definition (DELETE)**:
```sql
bucket_id = 'job-photos' AND (storage.foldername(name))[1] = auth.uid()::text
```

6. Click "Review" then "Save policy"

This ensures users can only upload, view, and delete their own photos.

## Step 6: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure settings:
   - **Enable email confirmations**: OFF (for development)
   - **Enable email signups**: ON
   - **Minimum password length**: 8
4. Click "Save"

### Email Templates (Optional)

Customize auth emails in **Authentication** → **Email Templates**:
- Confirm signup
- Reset password
- Magic link

## Step 7: Set Up Edge Functions (Optional)

If you want to use serverless functions for webhooks, email sending, etc.:

```bash
# Deploy all edge functions
supabase functions deploy chat-assistant
supabase functions deploy create-payment-intent
supabase functions deploy send-email
supabase functions deploy send-invoice
supabase functions deploy send-proposal
supabase functions deploy submit-support-ticket
supabase functions deploy stripe-webhook
supabase functions deploy whisper-transcribe
```

### Required Secrets for Edge Functions

```bash
# Set secrets
supabase secrets set RESEND_API_KEY=your-resend-key
supabase secrets set OPENAI_API_KEY=your-openai-key
supabase secrets set STRIPE_SECRET_KEY=your-stripe-key
supabase secrets set STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

## Step 8: Test the Setup

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Test Authentication

1. Open `http://localhost:5173`
2. Click "Sign Up"
3. Create a test account
4. Verify you can log in
5. Check Supabase dashboard → **Authentication** → **Users** to see your user

### Test Database

1. Log in to your app
2. Try creating a customer
3. Go to Supabase dashboard → **Table Editor** → **customers**
4. Verify your customer was created

### Test Storage

1. Create a job in your app
2. Try uploading a photo
3. Go to Supabase dashboard → **Storage** → **job-photos**
4. Verify your photo was uploaded

## Database Schema Overview

Your database includes these tables:

- **contractor_profiles** - User business profiles
- **customers** - Customer records
- **jobs** - Job/proposal records
- **invoices** - Invoice records
- **invoice_items** - Line items for invoices
- **photos** - Photo metadata (files in Storage)
- **activities** - Activity/audit log
- **notifications** - User notifications
- **user_settings** - User preferences
- **support_tickets** - Support requests
- **faq_ratings** - FAQ feedback
- **communications** - Email/SMS tracking
- **payments** - Payment records

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## API Usage Examples

### Authentication

```typescript
import { supabase } from './lib/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
await supabase.auth.signOut();
```

### Database Operations

```typescript
import { database } from './lib/database';

// Get all customers
const customers = await database.customers.getAll();

// Create a customer
const customer = await database.customers.create({
  name: 'John Smith',
  email: 'john@example.com',
  phone: '555-1234'
});

// Update a job status
const job = await database.jobs.updateStatus(jobId, 'signed');
```

### Real-time Subscriptions

```typescript
import { subscribeToTable } from './lib/realtimeHelpers';

// Subscribe to job changes
const channel = subscribeToTable('jobs', {
  onInsert: (job) => console.log('New job:', job),
  onUpdate: (job) => console.log('Updated job:', job),
  onDelete: (job) => console.log('Deleted job:', job)
});

// Clean up
await unsubscribe(channel);
```

### Storage

```typescript
import { uploadPhoto, getJobPhotos } from './lib/storage';

// Upload a photo
const file = document.querySelector('input[type="file"]').files[0];
const result = await uploadPhoto(file, jobId, 'Before photo');

// Get job photos
const photos = await getJobPhotos(jobId);
```

## Troubleshooting

### "Missing Supabase environment variables"

- Verify `.env.local` file exists
- Verify variables start with `VITE_`
- Restart dev server after adding variables

### "JWT expired" errors

- User session expired
- Sign out and sign in again
- Supabase auto-refreshes tokens, but manual refresh may be needed

### "Row Level Security" errors

- User not authenticated
- Trying to access another user's data
- Check RLS policies in Supabase dashboard

### Photos not uploading

- Verify `job-photos` bucket exists
- Verify storage policies are configured
- Check browser console for detailed errors

### Migrations failing

- Run migrations in order
- Check for syntax errors in SQL
- Verify no duplicate table names

## Security Best Practices

✅ **DO:**
- Use RLS policies on all tables
- Validate data on both client and server
- Use prepared statements (Supabase does this automatically)
- Log out users after inactivity
- Use HTTPS in production

❌ **DON'T:**
- Expose service role key in frontend code
- Disable RLS in production
- Store sensitive data in localStorage
- Share credentials in code repositories
- Use SQL string concatenation

## Production Checklist

Before deploying to production:

- [ ] Enable email confirmations in Auth settings
- [ ] Set up custom SMTP for emails
- [ ] Configure custom domain
- [ ] Set up database backups
- [ ] Enable Point-in-Time Recovery
- [ ] Set up monitoring and alerts
- [ ] Review and tighten RLS policies
- [ ] Enable rate limiting
- [ ] Set up CDN for storage
- [ ] Configure CORS policies
- [ ] Set up error tracking (Sentry, etc.)

## Getting Help

- **Supabase Docs**: https://supabase.com/docs
- **Discord**: https://discord.supabase.com
- **GitHub Issues**: https://github.com/supabase/supabase/issues

## Next Steps

After setup is complete:

1. Test all features in development
2. Customize email templates
3. Configure Stripe for payments
4. Set up monitoring and analytics
5. Deploy to production
6. Set up CI/CD pipeline

Your backend is now fully configured and ready to use! 🚀
