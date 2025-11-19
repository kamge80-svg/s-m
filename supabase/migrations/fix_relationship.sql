-- Fix: Add foreign key relationship between products and profiles
-- This allows Supabase to understand the JOIN query

-- Drop the existing foreign key if it exists (just in case)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_user_id_fkey;

-- Add the foreign key constraint with proper naming
ALTER TABLE products 
ADD CONSTRAINT products_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Verify the relationship
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='products';
