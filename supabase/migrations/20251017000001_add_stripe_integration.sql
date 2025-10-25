/*
  # Add Stripe Integration Fields

  1. Modifications to Existing Tables
    - Add Stripe Connect fields to contractor_profiles
    - Add payment tracking fields to invoices
    - Add payment status and metadata

  2. New Tables
    - Add payment_transactions table for payment history
    - Add payout_records table for contractor payouts

  3. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Add Stripe Connect fields to contractor_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contractor_profiles' AND column_name = 'stripe_account_id'
  ) THEN
    ALTER TABLE contractor_profiles ADD COLUMN stripe_account_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contractor_profiles' AND column_name = 'stripe_account_status'
  ) THEN
    ALTER TABLE contractor_profiles ADD COLUMN stripe_account_status text DEFAULT 'not_connected';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contractor_profiles' AND column_name = 'stripe_charges_enabled'
  ) THEN
    ALTER TABLE contractor_profiles ADD COLUMN stripe_charges_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contractor_profiles' AND column_name = 'stripe_payouts_enabled'
  ) THEN
    ALTER TABLE contractor_profiles ADD COLUMN stripe_payouts_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contractor_profiles' AND column_name = 'stripe_onboarding_completed_at'
  ) THEN
    ALTER TABLE contractor_profiles ADD COLUMN stripe_onboarding_completed_at timestamptz;
  END IF;
END $$;

-- Add payment tracking fields to invoices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN stripe_payment_intent_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'stripe_payment_link'
  ) THEN
    ALTER TABLE invoices ADD COLUMN stripe_payment_link text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE invoices ADD COLUMN payment_method text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'payment_metadata'
  ) THEN
    ALTER TABLE invoices ADD COLUMN payment_metadata jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'balance_due'
  ) THEN
    ALTER TABLE invoices ADD COLUMN balance_due decimal(10,2) DEFAULT 0;
    UPDATE invoices SET balance_due = total WHERE balance_due = 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'amount_paid'
  ) THEN
    ALTER TABLE invoices ADD COLUMN amount_paid decimal(10,2) DEFAULT 0;
  END IF;
END $$;

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES contractor_profiles(id) ON DELETE CASCADE NOT NULL,
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id text NOT NULL,
  stripe_charge_id text,
  amount decimal(10,2) NOT NULL,
  fee_amount decimal(10,2) DEFAULT 0,
  net_amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  customer_email text,
  customer_name text,
  failure_reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment transactions"
  ON payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment transactions"
  ON payment_transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create payout_records table
CREATE TABLE IF NOT EXISTS payout_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES contractor_profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_payout_id text NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending',
  arrival_date date,
  description text,
  failure_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payout_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payout records"
  ON payout_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_stripe_account ON contractor_profiles(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_payment_intent ON invoices(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice_id ON payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_id ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payout_records_user_id ON payout_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_records_stripe_id ON payout_records(stripe_payout_id);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payout_records_updated_at ON payout_records;
CREATE TRIGGER update_payout_records_updated_at
  BEFORE UPDATE ON payout_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
