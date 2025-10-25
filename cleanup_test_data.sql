/*
  # Cleanup Test Data Before Production Launch

  WARNING: This will permanently delete all data from test/demo accounts!

  Run this in Supabase SQL Editor BEFORE launching to real users.

  This script:
  1. Identifies test users by email patterns
  2. Deletes all their related data (cascading)
  3. Removes test user profiles

  Test user patterns:
  - Emails containing 'test', 'demo', 'example', 'temp'
  - Any @test.com, @example.com, @demo.com domains
*/

-- Step 1: View test users first (DO NOT DELETE YET)
-- Run this first to review what will be deleted
SELECT
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE
  email LIKE '%test%'
  OR email LIKE '%demo%'
  OR email LIKE '%example%'
  OR email LIKE '%temp%'
  OR email LIKE '%@test.com'
  OR email LIKE '%@example.com'
  OR email LIKE '%@demo.com'
ORDER BY created_at DESC;

-- Step 2: Count how many records will be deleted
SELECT
  'Activities' as table_name,
  COUNT(*) as records_to_delete
FROM activities
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%'
)
UNION ALL
SELECT
  'Photos',
  COUNT(*)
FROM photos
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%'
)
UNION ALL
SELECT
  'Invoices',
  COUNT(*)
FROM invoices
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%'
)
UNION ALL
SELECT
  'Jobs',
  COUNT(*)
FROM jobs
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%'
)
UNION ALL
SELECT
  'Customers',
  COUNT(*)
FROM customers
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%'
);

-- Step 3: ACTUAL DELETION (Run this ONLY after reviewing above)
-- Delete all test user data in correct order (respecting foreign keys)

BEGIN;

-- Delete notifications
DELETE FROM notifications
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' OR email LIKE '%temp%'
);

-- Delete activities
DELETE FROM activities
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' OR email LIKE '%temp%'
);

-- Delete photos
DELETE FROM photos
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' OR email LIKE '%temp%'
);

-- Delete communications
DELETE FROM communications
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' OR email LIKE '%temp%'
);

-- Delete support tickets
DELETE FROM support_tickets
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' OR email LIKE '%temp%'
);

-- Delete payments
DELETE FROM payments
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' OR email LIKE '%temp%'
);

-- Delete invoice items (must delete before invoices)
DELETE FROM invoice_items
WHERE invoice_id IN (
  SELECT id FROM invoices
  WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' OR email LIKE '%temp%'
  )
);

-- Delete invoices
DELETE FROM invoices
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' OR email LIKE '%temp%'
);

-- Delete jobs
DELETE FROM jobs
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' OR email LIKE '%temp%'
);

-- Delete customers
DELETE FROM customers
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' OR email LIKE '%temp%'
);

-- Delete stripe accounts
DELETE FROM stripe_accounts
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' OR email LIKE '%temp%'
);

-- Delete usage logs
DELETE FROM usage_logs
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' OR email LIKE '%temp%'
);

-- Delete contractor profiles
DELETE FROM contractor_profiles
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email LIKE '%test%' OR email LIKE '%demo%' OR email LIKE '%example%' OR email LIKE '%temp%'
);

-- COMMIT the transaction (uncomment when ready)
-- COMMIT;

-- If something went wrong, ROLLBACK instead:
-- ROLLBACK;


-- Step 4: Delete test users from auth.users
-- IMPORTANT: This MUST be done in Supabase Auth Dashboard, not via SQL!
-- Go to: Authentication > Users > Search for test users > Delete each one

-- Step 5: Verify cleanup
SELECT
  'Activities remaining' as check_name,
  COUNT(*) as count
FROM activities
UNION ALL
SELECT
  'Photos remaining',
  COUNT(*)
FROM photos
UNION ALL
SELECT
  'Invoices remaining',
  COUNT(*)
FROM invoices
UNION ALL
SELECT
  'Jobs remaining',
  COUNT(*)
FROM jobs
UNION ALL
SELECT
  'Customers remaining',
  COUNT(*)
FROM customers
UNION ALL
SELECT
  'Contractor profiles remaining',
  COUNT(*)
FROM contractor_profiles;

/*
  FINAL CHECKLIST:

  □ Reviewed test users list (Step 1)
  □ Checked deletion counts (Step 2)
  □ Ran deletion script with COMMIT (Step 3)
  □ Deleted auth.users manually in dashboard (Step 4)
  □ Verified all counts are 0 (Step 5)
  □ Ready for first real user signup!
*/
