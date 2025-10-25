/*
  # Add Tax Fields

  1. Changes to scope_items
    - Add `taxable` boolean column (default true) to allow per-item tax toggle
  
  2. Changes to jobs
    - Add `tax_exempt` boolean column (default false) for job-level tax exemption
    - Add `tax_override_rate` numeric column for custom tax rate per job
  
  3. Changes to user_settings
    - Add `tax_rate` numeric column (default 0.00) for user's default tax rate
  
  4. Notes
    - All columns use IF NOT EXISTS to prevent errors on re-run
    - Tax rate is stored as percentage (e.g., 8.25 for 8.25%)
    - Effective rate: job override > user default > 0
*/

-- Allow per-item tax toggle
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scope_items' AND column_name = 'taxable'
  ) THEN
    ALTER TABLE scope_items ADD COLUMN taxable boolean DEFAULT true;
  END IF;
END $$;

-- Job-level tax control
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'tax_exempt'
  ) THEN
    ALTER TABLE jobs ADD COLUMN tax_exempt boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'tax_override_rate'
  ) THEN
    ALTER TABLE jobs ADD COLUMN tax_override_rate numeric(5,2);
  END IF;
END $$;

-- User default tax rate
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'tax_rate'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN tax_rate numeric(5,2) DEFAULT 0.00;
  END IF;
END $$;