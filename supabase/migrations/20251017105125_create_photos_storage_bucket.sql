/*
  # Create photos storage bucket for job images

  1. Storage
    - Create `photos` bucket for storing job photos
    - Make bucket public for MVP (images accessible without auth)
    
  2. Security
    - Public bucket allows read access to all
    - Authenticated users can upload/delete their own photos
    - Photos are organized by job ID in folder structure: jobs/{jobId}/{timestamp}-{random}.{ext}
    
  3. Notes
    - Bucket is public for MVP simplicity
    - Production should restrict to authenticated users only
    - Photos are stored in path format: jobs/{jobId}/{filename}
*/

-- Create the photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own photos" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public read access"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'photos');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'photos');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete own photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'photos');