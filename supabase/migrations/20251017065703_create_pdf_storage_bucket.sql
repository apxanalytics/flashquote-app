/*
  # Create PDF Storage Bucket

  1. New Storage Bucket
    - `pdf` - for storing generated proposal PDFs
    - Public access for easy sharing
  
  2. Security
    - Enable RLS on storage.objects
    - Allow authenticated users to upload PDFs
    - Allow public read access to PDFs
*/

-- Create the pdf bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf', 'pdf', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload PDFs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload PDFs'
  ) THEN
    CREATE POLICY "Authenticated users can upload PDFs"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'pdf');
  END IF;
END $$;

-- Allow authenticated users to update their PDFs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can update PDFs'
  ) THEN
    CREATE POLICY "Authenticated users can update PDFs"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'pdf')
    WITH CHECK (bucket_id = 'pdf');
  END IF;
END $$;

-- Allow public read access to PDFs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public read access to PDFs'
  ) THEN
    CREATE POLICY "Public read access to PDFs"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'pdf');
  END IF;
END $$;