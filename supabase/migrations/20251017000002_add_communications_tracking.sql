/*
  # Add Communications Tracking

  1. New Tables
    - `communications` - Track all SMS and email communications
    - `communication_templates` - Reusable email/SMS templates
    - `communication_costs` - Track usage and costs

  2. Modifications
    - Add communication preferences to user_settings
    - Add automated follow-up settings

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Create communications table
CREATE TABLE IF NOT EXISTS communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES contractor_profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  type text NOT NULL,
  channel text NOT NULL,
  recipient text NOT NULL,
  subject text,
  message text NOT NULL,
  status text DEFAULT 'sent',
  external_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  cost decimal(10,4) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own communications"
  ON communications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own communications"
  ON communications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create communication_templates table
CREATE TABLE IF NOT EXISTS communication_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES contractor_profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  channel text NOT NULL,
  subject text,
  template_body text NOT NULL,
  variables jsonb DEFAULT '{}'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own templates"
  ON communication_templates
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create communication_costs table for usage tracking
CREATE TABLE IF NOT EXISTS communication_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES contractor_profiles(id) ON DELETE CASCADE NOT NULL,
  month date NOT NULL,
  sms_count integer DEFAULT 0,
  email_count integer DEFAULT 0,
  sms_cost decimal(10,4) DEFAULT 0,
  email_cost decimal(10,4) DEFAULT 0,
  total_cost decimal(10,4) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE communication_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own communication costs"
  ON communication_costs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add communication preferences to user_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'communication_settings'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN communication_settings jsonb DEFAULT '{"auto_follow_up": true, "follow_up_days": 2, "reminder_days_before": 3, "send_sms": true, "send_email": true}'::jsonb;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_communications_user_id ON communications(user_id);
CREATE INDEX IF NOT EXISTS idx_communications_customer_id ON communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_communications_job_id ON communications(job_id);
CREATE INDEX IF NOT EXISTS idx_communications_invoice_id ON communications(invoice_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_channel ON communications(channel);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at);
CREATE INDEX IF NOT EXISTS idx_communication_templates_user_id ON communication_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_templates_type ON communication_templates(type);
CREATE INDEX IF NOT EXISTS idx_communication_costs_user_id ON communication_costs(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_costs_month ON communication_costs(month);

-- Create trigger for communication_templates updated_at
DROP TRIGGER IF EXISTS update_communication_templates_updated_at ON communication_templates;
CREATE TRIGGER update_communication_templates_updated_at
  BEFORE UPDATE ON communication_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for communication_costs updated_at
DROP TRIGGER IF EXISTS update_communication_costs_updated_at ON communication_costs;
CREATE TRIGGER update_communication_costs_updated_at
  BEFORE UPDATE ON communication_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update communication costs
CREATE OR REPLACE FUNCTION update_communication_cost()
RETURNS TRIGGER AS $$
DECLARE
  month_start date;
  sms_cost_rate decimal(10,4) := 0.0075;
  email_cost_rate decimal(10,4) := 0.0001;
BEGIN
  month_start := DATE_TRUNC('month', NEW.created_at)::date;

  INSERT INTO communication_costs (user_id, month, sms_count, email_count, sms_cost, email_cost, total_cost)
  VALUES (
    NEW.user_id,
    month_start,
    CASE WHEN NEW.channel = 'sms' THEN 1 ELSE 0 END,
    CASE WHEN NEW.channel = 'email' THEN 1 ELSE 0 END,
    CASE WHEN NEW.channel = 'sms' THEN sms_cost_rate ELSE 0 END,
    CASE WHEN NEW.channel = 'email' THEN email_cost_rate ELSE 0 END,
    NEW.cost
  )
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    sms_count = communication_costs.sms_count + CASE WHEN NEW.channel = 'sms' THEN 1 ELSE 0 END,
    email_count = communication_costs.email_count + CASE WHEN NEW.channel = 'email' THEN 1 ELSE 0 END,
    sms_cost = communication_costs.sms_cost + CASE WHEN NEW.channel = 'sms' THEN sms_cost_rate ELSE 0 END,
    email_cost = communication_costs.email_cost + CASE WHEN NEW.channel = 'email' THEN email_cost_rate ELSE 0 END,
    total_cost = communication_costs.total_cost + NEW.cost,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update costs
DROP TRIGGER IF EXISTS trigger_update_communication_cost ON communications;
CREATE TRIGGER trigger_update_communication_cost
  AFTER INSERT ON communications
  FOR EACH ROW
  EXECUTE FUNCTION update_communication_cost();
