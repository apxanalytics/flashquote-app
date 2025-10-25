/*
  # Add paid_at timestamp to invoices

  1. Changes
    - Add `paid_at` column to `invoices` table
      - Type: timestamptz (nullable)
      - Purpose: Track exact payment date for accurate Month-to-Date revenue calculations
      - Nullable to support existing and unpaid invoices

  2. Notes
    - This field should be set to `now()` when an invoice status changes to 'paid'
    - Enables precise filtering for revenue reports by payment date rather than invoice creation date
    - Existing invoices will have NULL paid_at until they are paid
*/

ALTER TABLE IF EXISTS invoices
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;
