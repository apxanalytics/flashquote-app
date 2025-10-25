/*
  # Create Contractor Profiles Schema

  1. New Tables
    - `contractor_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `business_name` (text)
      - `owner_name` (text)
      - `phone_number` (text)
      - `trade_type` (text)
      - `years_in_business` (text)
      - `team_size` (text)
      - `annual_revenue_range` (text, nullable)
      - `service_area_zipcode` (text)
      - `hourly_rate` (numeric, nullable)
      - `material_markup_percentage` (numeric, nullable)
      - `payment_terms` (text)
      - `onboarding_completed` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `contractor_profiles` table
    - Add policies for users to manage their own profiles
*/

CREATE TABLE IF NOT EXISTS contractor_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  owner_name text NOT NULL,
  phone_number text NOT NULL,
  trade_type text,
  years_in_business text,
  team_size text,
  annual_revenue_range text,
  service_area_zipcode text,
  hourly_rate numeric,
  material_markup_percentage numeric,
  payment_terms text,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contractor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON contractor_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON contractor_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON contractor_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON contractor_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
