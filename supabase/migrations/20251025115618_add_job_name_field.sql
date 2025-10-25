/*
  # Add Job Name Field

  1. Changes to jobs table
    - Add `job_name` text column with default value
    - Backfill existing jobs with 'Untitled Job'
  
  2. Notes
    - Job name is required for better job identification
    - Default ensures all jobs have a name
*/

-- Add job_name column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'job_name'
  ) THEN
    ALTER TABLE jobs ADD COLUMN job_name text;
  END IF;
END $$;

-- Backfill existing jobs
UPDATE jobs SET job_name = COALESCE(job_name, 'Untitled Job') WHERE job_name IS NULL;

-- Set default for future inserts
ALTER TABLE jobs ALTER COLUMN job_name SET DEFAULT 'Untitled Job';