/*
  # Add Price Book Enhancements and Aliases

  1. Schema Changes
    - Add `unit` and `default_price` columns to `pricing_categories` table
    - Create `pricing_aliases` table for category synonyms and variants
    - Add GIN index for fast text search on aliases

  2. New Tables
    - `pricing_aliases`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to pricing_categories)
      - `alias` (text, the synonym or variant name)
      - Unique constraint on (category_id, alias)

  3. Security
    - Enable RLS on pricing_aliases
    - Add policies for authenticated users to read their pricing data

  4. Purpose
    - Enable intelligent price detection from natural language descriptions
    - Support variants like "LVP", "vinyl plank", "plank flooring" mapping to same category
    - Auto-fill unit, quantity, and price based on description text
*/

-- Add unit and default_price to pricing_categories if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pricing_categories' AND column_name = 'unit'
  ) THEN
    ALTER TABLE pricing_categories 
      ADD COLUMN unit text CHECK (unit IN ('each','sqft','lf','hour','day')) DEFAULT 'each';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pricing_categories' AND column_name = 'default_price'
  ) THEN
    ALTER TABLE pricing_categories 
      ADD COLUMN default_price numeric(12,2) DEFAULT 0;
  END IF;
END $$;

-- Create pricing_aliases table
CREATE TABLE IF NOT EXISTS pricing_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES pricing_categories(id) ON DELETE CASCADE,
  alias text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (category_id, alias)
);

-- Add GIN index for fast text search
CREATE INDEX IF NOT EXISTS idx_pricing_alias_alias 
  ON pricing_aliases USING gin (to_tsvector('simple', alias));

-- Enable RLS
ALTER TABLE pricing_aliases ENABLE ROW LEVEL SECURITY;

-- Policies for pricing_aliases
CREATE POLICY "Users can read pricing aliases"
  ON pricing_aliases FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert pricing aliases"
  ON pricing_aliases FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update pricing aliases"
  ON pricing_aliases FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete pricing aliases"
  ON pricing_aliases FOR DELETE
  TO authenticated
  USING (true);

-- Add ai_confidence column to scope_items if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scope_items' AND column_name = 'ai_confidence'
  ) THEN
    ALTER TABLE scope_items 
      ADD COLUMN ai_confidence numeric(3,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scope_items' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE scope_items 
      ADD COLUMN category_id uuid REFERENCES pricing_categories(id) ON DELETE SET NULL;
  END IF;
END $$;