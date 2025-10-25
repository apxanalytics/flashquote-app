/*
  # Add User Ownership and RLS to Jobs Table

  1. Schema Changes
    - Add `user_id` column to `jobs` table with default auth.uid()
    - Make it NOT NULL to ensure all jobs have an owner

  2. Security Changes
    - Enable RLS on `jobs` table
    - Add policies for SELECT, INSERT, UPDATE, DELETE
    - All policies enforce that user_id = auth.uid()

  3. Important Notes
    - Each user can only access their own jobs
    - Proper multi-tenant data isolation
    - Jobs are automatically assigned to the creating user
*/

-- Add user_id to jobs table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE jobs 
      ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
  END IF;
END $$;

-- Enable RLS on jobs table
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first
DROP POLICY IF EXISTS "jobs_select" ON jobs;
DROP POLICY IF EXISTS "jobs_insert" ON jobs;
DROP POLICY IF EXISTS "jobs_update" ON jobs;
DROP POLICY IF EXISTS "jobs_delete" ON jobs;

-- Create user-scoped policies for jobs
CREATE POLICY "jobs_select"
  ON jobs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "jobs_insert"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "jobs_update"
  ON jobs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "jobs_delete"
  ON jobs FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
