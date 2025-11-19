# 🚨 Fix Rapide - "Failed to load products"

## Ce qui a été fait

1. ✅ Ajout de logs détaillés dans Feed
2. ✅ Séparation du chargement products/profiles pour identifier le problème
3. ✅ Création d'un composant de test Supabase
4. ✅ Script SQL pour corriger les permissions

## 🎯 Actions Immédiates

### Étape 1: Lancer l'app et tester
```bash
npm run dev
```

### Étape 2: Utiliser le composant de test
1. L'app va charger avec un panneau de test en haut à droite
2. Clique sur "Run Tests"
3. Regarde les résultats - ils vont identifier le problème exact

### Étape 3: Interpréter les résultats

#### Si tu vois "❌ Products table error"
**Problème:** Permissions RLS bloquent la lecture
**Solution:** Exécute `supabase/fix_permissions.sql` dans Supabase SQL Editor

#### Si tu vois "❌ JOIN query error"
**Problème:** Le JOIN avec profiles échoue
**Solution:** 
1. Vérifie que ta table `profiles` existe
2. Vérifie que ton profil existe dans la table
3. Exécute ce SQL:
```sql
-- Créer ton profil s'il n'existe pas
INSERT INTO profiles (id, username, full_name, bio, avatar_url)
VALUES (auth.uid(), 'ton_username', '', '', '')
ON CONFLICT (id) DO NOTHING;
```

#### Si tu vois "⚠️ Your profile not found"
**Problème:** Ton profil n'existe pas
**Solution:** Exécute dans Supabase SQL Editor:
```sql
INSERT INTO profiles (id, username, full_name, bio, avatar_url)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'username', 'user_' || substring(id::text, 1, 8)),
  '',
  '',
  ''
FROM auth.users
WHERE id = auth.uid()
ON CONFLICT (id) DO NOTHING;
```

#### Si tu vois "✅" partout mais toujours pas de produits
**Problème:** Il n'y a simplement pas de produits
**Solution:** Publie un nouveau produit

### Étape 4: Corriger les permissions (si nécessaire)

1. Va sur https://app.supabase.com
2. Ouvre ton projet
3. Va dans **SQL Editor**
4. Copie/colle le contenu de `supabase/fix_permissions.sql`
5. Clique sur "Run"
6. Recharge ton application

### Étape 5: Vérifier manuellement dans Supabase

#### Vérifier les produits
```sql
SELECT * FROM products ORDER BY created_at DESC LIMIT 5;
```

#### Vérifier les profils
```sql
SELECT * FROM profiles LIMIT 5;
```

#### Vérifier ton profil
```sql
SELECT * FROM profiles WHERE id = auth.uid();
```

#### Test complet
```sql
SELECT 
  p.id,
  p.title,
  p.created_at,
  pr.username
FROM products p
LEFT JOIN profiles pr ON pr.id = p.user_id
ORDER BY p.created_at DESC
LIMIT 5;
```

## 🔧 Solutions Rapides

### Solution 1: Recréer les policies
```sql
-- Copie/colle dans SQL Editor
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO authenticated
  USING (true);
```

### Solution 2: Créer ton profil manuellement
```sql
-- Remplace 'ton_username' par ton username désiré
INSERT INTO profiles (id, username, full_name, bio, avatar_url)
VALUES (auth.uid(), 'ton_username', '', '', '')
ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username;
```

### Solution 3: Vérifier le bucket storage
1. Va dans **Storage** > **products**
2. Clique sur les 3 points > **Edit bucket**
3. Assure-toi que "Public bucket" est ✅ coché
4. Sauvegarde

## 📊 Checklist de Vérification

- [ ] Le composant de test affiche "✅ Products table accessible"
- [ ] Le composant de test affiche "✅ Your profile found"
- [ ] Le composant de test affiche "✅ JOIN query works"
- [ ] La console montre "Products loaded: X products"
- [ ] Pas d'erreur rouge dans la console
- [ ] Le bucket storage est public

## 🎬 Après le Fix

Une fois que tout fonctionne:

1. **Retire le composant de test** de App.tsx:
```typescript
// Supprime ces lignes dans App.tsx
import SupabaseTest from './components/SupabaseTest';
<SupabaseTest />
```

2. **Retire les logs de debug** (optionnel):
```typescript
// Dans Feed.tsx, tu peux retirer les console.log
```

## 💡 Prévention Future

Pour éviter ce problème à l'avenir:

1. Toujours créer le profil lors de l'inscription (déjà fait dans AuthContext)
2. Vérifier les permissions RLS avant de déployer
3. Tester avec plusieurs utilisateurs
4. Garder les logs en développement

## 📞 Si Rien ne Fonctionne

Fournis-moi:
1. Les résultats du composant de test (screenshot ou copie)
2. Les logs de la console (F12)
3. Le résultat de cette requête SQL:
```sql
SELECT 
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT username FROM profiles WHERE id = auth.uid()) as my_username;
```
