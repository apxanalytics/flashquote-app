/*
  # Add Analytics and Tracking Fields

  1. Modifications to Existing Tables
    - Add `view_count` to jobs table for proposal tracking
    - Add `total_amount` to jobs table for revenue calculations
    - Add `completed_date` to jobs table for completed job tracking
    - Add `paid_date` to invoices table for payment tracking
    - Add `total_amount` to invoices table for revenue calculations
    - Add `contractor_id` field to jobs and invoices for analytics queries

  2. New Tables
    - Add `photos` table for job photo storage
    - Add `user_settings` table for user preferences

  3. Notes
    - All changes use IF NOT EXISTS to prevent errors
    - Maintains backward compatibility with existing data
*/

-- Add missing columns to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE jobs ADD COLUMN view_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE jobs ADD COLUMN total_amount decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'completed_date'
  ) THEN
    ALTER TABLE jobs ADD COLUMN completed_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'contractor_id'
  ) THEN
    ALTER TABLE jobs ADD COLUMN contractor_id uuid REFERENCES contractor_profiles(id) ON DELETE CASCADE;
    -- Copy user_id to contractor_id for existing records
    UPDATE jobs SET contractor_id = user_id WHERE contractor_id IS NULL;
  END IF;
END $$;

-- Add missing columns to invoices table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'paid_date'
  ) THEN
    ALTER TABLE invoices ADD COLUMN paid_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE invoices ADD COLUMN total_amount decimal(10,2) DEFAULT 0;
    -- Copy from total column if it exists
    UPDATE invoices SET total_amount = total WHERE total_amount = 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'contractor_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN contractor_id uuid REFERENCES contractor_profiles(id) ON DELETE CASCADE;
    -- Copy user_id to contractor_id for existing records
    UPDATE invoices SET contractor_id = user_id WHERE contractor_id IS NULL;
  END IF;
END $$;

-- Create photos table if not exists
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES contractor_profiles(id) ON DELETE CASCADE NOT NULL,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  mime_type text,
  caption text,
  tags text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own photos"
  ON photos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON photos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON photos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user_settings table if not exists
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  ai_settings jsonb DEFAULT '{}'::jsonb,
  notification_settings jsonb DEFAULT '{}'::jsonb,
  payment_settings jsonb DEFAULT '{}'::jsonb,
  template_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_job_id ON photos(job_id);
CREATE INDEX IF NOT EXISTS idx_jobs_contractor_id ON jobs(contractor_id);
CREATE INDEX IF NOT EXISTS idx_jobs_completed_date ON jobs(completed_date);
CREATE INDEX IF NOT EXISTS idx_invoices_contractor_id ON invoices(contractor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_paid_date ON invoices(paid_date);

-- Create trigger for user_settings updated_at
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
