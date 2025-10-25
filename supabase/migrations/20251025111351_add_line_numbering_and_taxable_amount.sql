/*
  # Add Line Numbering and Taxable Amount

  1. Changes to scope_items
    - Add `line_no` integer column for stable line numbering
    - Add index on (job_id, line_no) for efficient sorting
    - Add `taxable_amount` numeric column for partial tax amounts
    - Backfill line_no for existing records based on id order per job
  
  2. Notes
    - line_no prevents renumbering when items are reordered or flagged
    - taxable_amount null means use full line total for tax calculation
    - Index improves query performance for job detail views
*/

-- Add line number column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scope_items' AND column_name = 'line_no'
  ) THEN
    ALTER TABLE scope_items ADD COLUMN line_no int;
  END IF;
END $$;

-- Add index for efficient sorting
CREATE INDEX IF NOT EXISTS scope_items_job_line ON scope_items(job_id, line_no);

-- Add taxable amount column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scope_items' AND column_name = 'taxable_amount'
  ) THEN
    ALTER TABLE scope_items ADD COLUMN taxable_amount numeric(12,2);
  END IF;
END $$;

-- Backfill line numbers for existing records
UPDATE scope_items si
SET line_no = sub.rn
FROM (
  SELECT id, job_id, row_number() OVER (PARTITION BY job_id ORDER BY id) as rn
  FROM scope_items
) sub
WHERE si.id = sub.id AND si.line_no IS NULL;