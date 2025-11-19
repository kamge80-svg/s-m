-- Script pour corriger les permissions RLS
-- Exécute ce script dans Supabase SQL Editor si les produits ne s'affichent pas

-- 1. Vérifier que RLS est activé
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes policies (si elles existent)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

-- 3. Recréer les policies correctement
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Vérifier les policies profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 5. Vérifier les permissions Storage
-- Note: Ceci doit être fait dans l'interface Storage > Policies

-- 6. Test: Vérifier que tu peux lire les produits
SELECT 
  p.id,
  p.title,
  p.created_at,
  pr.username
FROM products p
LEFT JOIN profiles pr ON pr.id = p.user_id
ORDER BY p.created_at DESC
LIMIT 5;

-- 7. Test: Vérifier ton profil
SELECT * FROM profiles WHERE id = auth.uid();

-- 8. Test: Compter les produits
SELECT COUNT(*) as total_products FROM products;
