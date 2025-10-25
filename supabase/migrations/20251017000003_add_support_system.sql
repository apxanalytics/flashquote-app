/*
  # Add Support System Tables

  1. New Tables
    - `support_tickets` - Track support requests
    - `faq_ratings` - Track FAQ helpfulness ratings
    - `onboarding_progress` - Track getting started checklist

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES contractor_profiles(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  category text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'open',
  priority text DEFAULT 'normal',
  attachments jsonb DEFAULT '[]'::jsonb,
  assigned_to text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own support tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own support tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own support tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create faq_ratings table
CREATE TABLE IF NOT EXISTS faq_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  faq_id text NOT NULL,
  rating text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE faq_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create faq ratings"
  ON faq_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add onboarding_checklist to user_settings if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'onboarding_checklist'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN onboarding_checklist jsonb DEFAULT '{"profile": false, "pricing": false, "firstProposal": false, "stripeConnected": false, "aiSettings": false}'::jsonb;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_faq_ratings_faq_id ON faq_ratings(faq_id);

-- Create trigger for support_tickets updated_at
DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
