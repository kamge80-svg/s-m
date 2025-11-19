/*
  # Create Storage Bucket for Products

  ## Overview
  Creates a public storage bucket for product media files (images and videos)
  and sets up appropriate access policies.

  ## Changes
  1. Create 'products' storage bucket
  2. Set bucket to public access
  3. Create storage policies for authenticated users to upload/delete their own files
  4. Allow public read access to all files

  ## Security
  - Anyone can view files (public bucket)
  - Only authenticated users can upload
  - Users can only delete their own files
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'products' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'products' );

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1] )
WITH CHECK ( bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'products' AND auth.uid()::text = (storage.foldername(name))[1] );
