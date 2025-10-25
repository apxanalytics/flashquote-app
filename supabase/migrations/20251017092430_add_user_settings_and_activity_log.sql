/*
  # Add User Settings and Activity Log

  1. New Tables
    - `user_settings`
      - `user_id` (uuid, primary key) - Links to contractor_profiles
      - `checklist_skipped` (boolean) - Whether user dismissed the checklist
      - `checklist_completed_at` (timestamptz) - When all items were completed
      - `has_business_profile` (boolean) - Business profile completed flag
      - `has_first_proposal` (boolean) - First proposal created flag
      - `has_first_invoice` (boolean) - First invoice sent flag
      - `has_first_customer` (boolean) - First customer added flag
      - `updated_at` (timestamptz) - Last update timestamp

    - `activity_log`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid) - Links to contractor_profiles
      - `type` (text) - Activity type (job_created, proposal_sent, etc.)
      - `ref_id` (uuid) - Reference to related entity
      - `title` (text) - Short description
      - `created_at` (timestamptz) - Activity timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data

  3. Indexes
    - Index on activity_log for efficient queries by user and date
*/

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  checklist_skipped boolean DEFAULT false,
  checklist_completed_at timestamptz,
  has_business_profile boolean DEFAULT false,
  has_first_proposal boolean DEFAULT false,
  has_first_invoice boolean DEFAULT false,
  has_first_customer boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  ref_id uuid,
  title text,
  created_at timestamptz DEFAULT now()
);

-- Create index for efficient activity queries
CREATE INDEX IF NOT EXISTS idx_activity_user_created 
  ON activity_log(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for activity_log
CREATE POLICY "Users can view own activity"
  ON activity_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp
DROP TRIGGER IF EXISTS user_settings_updated_at ON user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_timestamp();