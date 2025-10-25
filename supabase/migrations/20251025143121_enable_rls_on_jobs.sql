/*
  # Enable Row Level Security on jobs table

  1. Changes
    - Enable RLS on the jobs table to enforce security policies
    
  2. Security
    - Activates existing RLS policies for the jobs table
    - Ensures users can only access their own jobs
*/

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
