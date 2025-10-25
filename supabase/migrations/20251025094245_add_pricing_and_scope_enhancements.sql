/*
  # Add pricing and scope item enhancements

  1. Changes to pricing_categories
    - Add `unit` column with constraint
    - Add `default_price` column

  2. Changes to scope_items
    - Add `category_id` foreign key to pricing_categories
    - Add `unit` column with constraint
    - Add `quantity` column
    - Add `unit_price` column
    - Add `total` generated column (quantity * unit_price)
    - Add `finalized` boolean flag
    - Add `description_raw` for unpolished text
    - Add `description_clean` for polished text

  3. Indexes
    - Add index on scope_items(job_id)
    - Add index on scope_items(category_id)

  4. View
    - Create scope_items_status view for red/yellow/green status
*/

-- Pricing categories enhancements
ALTER TABLE pricing_categories
  ADD COLUMN IF NOT EXISTS unit text 
    CHECK (unit IN ('unit','sqft','lf','hour','day','each')) 
    DEFAULT 'unit',
  ADD COLUMN IF NOT EXISTS default_price numeric(12,2) DEFAULT 0;

-- Scope items enhancements
ALTER TABLE scope_items
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES pricing_categories(id),
  ADD COLUMN IF NOT EXISTS unit text 
    CHECK (unit IN ('unit','sqft','lf','hour','day','each')) 
    DEFAULT 'unit',
  ADD COLUMN IF NOT EXISTS quantity numeric(12,3) DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit_price numeric(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS finalized boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS description_raw text,
  ADD COLUMN IF NOT EXISTS description_clean text;

-- Add total as generated column (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scope_items' AND column_name = 'total'
  ) THEN
    ALTER TABLE scope_items 
      ADD COLUMN total numeric(12,2) 
      GENERATED ALWAYS AS (COALESCE(quantity,0) * COALESCE(unit_price,0)) STORED;
  END IF;
END $$;

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scope_items_job ON scope_items(job_id);
CREATE INDEX IF NOT EXISTS idx_scope_items_category ON scope_items(category_id);

-- Status view (red/yellow/green)
CREATE OR REPLACE VIEW scope_items_status AS
SELECT
  id, job_id, description_clean, quantity, unit_price, total, finalized,
  CASE
    WHEN (description_clean IS NULL OR description_clean = '' OR total = 0) THEN 'red'
    WHEN (finalized IS TRUE AND total > 0) THEN 'green'
    ELSE 'yellow'
  END AS status
FROM scope_items;
