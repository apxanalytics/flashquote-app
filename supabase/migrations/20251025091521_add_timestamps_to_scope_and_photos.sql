/*
  # Add timestamps to scope_items and media_photos

  1. Changes
    - Add `created_at` column to `scope_items` table with default now()
    - Add `created_at` column to `media_photos` table with default now()
    - Create indexes on both created_at columns for better query performance

  2. Notes
    - Using IF NOT EXISTS to prevent errors if columns already exist
    - Default value of now() ensures all new records get timestamps automatically
    - Indexes improve performance when ordering by created_at
*/

-- Add created_at to scope_items
ALTER TABLE scope_items 
ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Add index for scope_items.created_at
CREATE INDEX IF NOT EXISTS scope_items_created_at_idx 
ON scope_items(created_at);

-- Add created_at to media_photos
ALTER TABLE media_photos 
ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- Add index for media_photos.created_at
CREATE INDEX IF NOT EXISTS media_photos_created_at_idx 
ON media_photos(created_at);
