/*
  # Make customer_id nullable in jobs table

  1. Changes
    - Alter jobs.customer_id to allow NULL values
    - This enables creating draft jobs without requiring a customer upfront

  2. Reasoning
    - Draft jobs are created before a customer is assigned
    - Customer can be added later when the job is being finalized
    - Maintains referential integrity when customer_id is provided
*/

-- Make customer_id nullable in jobs table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs'
    AND column_name = 'customer_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE jobs ALTER COLUMN customer_id DROP NOT NULL;
  END IF;
END $$;