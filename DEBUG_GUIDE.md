# Guide de Débogage - Produit ne s'affiche pas

## Problème
Le produit publié ne s'affiche pas dans le feed après création.

## Étapes de Débogage

### 1. Vérifier la Console du Navigateur

Ouvre la console (F12) et cherche :

```
Starting upload...
Uploading to storage: ...
Upload successful: ...
Public URL: ...
Inserting product: ...
Product created successfully: ...
```

Si tu vois une erreur, note le message exact.

### 2. Vérifier Supabase Dashboard

1. Va sur https://app.supabase.com
2. Ouvre ton projet
3. Va dans **Table Editor** > **products**
4. Vérifie si ton produit apparaît dans la table

### 3. Vérifier les Permissions RLS

Si le produit est dans la table mais ne s'affiche pas :

1. Va dans **Authentication** > **Policies**
2. Vérifie la table `products`
3. Assure-toi que la policy "Products are viewable by everyone" existe :

```sql
-- Policy pour SELECT
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO authenticated
  USING (true);
```

### 4. Vérifier le Storage

1. Va dans **Storage** > **products**
2. Vérifie si ton fichier a été uploadé
3. Vérifie les permissions du bucket :
   - Public : ✅ OUI
   - Allowed MIME types : image/*, video/*

### 5. Erreurs Communes

#### Erreur: "new row violates row-level security policy"
**Solution:** Les policies RLS bloquent l'insertion
```sql
-- Vérifie que cette policy existe
CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

#### Erreur: "Failed to upload file"
**Solution:** Problème de permissions storage
```sql
-- Dans Storage > Policies
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'products' );
```

#### Erreur: "relation 'profiles' does not exist"
**Solution:** Le JOIN avec profiles échoue
- Vérifie que la table `profiles` existe
- Vérifie que ton profil existe dans la table

#### Le produit n'apparaît pas mais pas d'erreur
**Solution:** Problème de refresh
1. Recharge la page manuellement (F5)
2. Vérifie que `key={refreshFeed}` est bien dans App.tsx
3. Vérifie les logs console : "Loading products..." et "Products loaded: X products"

### 6. Tests Manuels

#### Test 1: Vérifier l'insertion directe
```sql
-- Dans SQL Editor de Supabase
SELECT * FROM products 
WHERE user_id = 'ton-user-id' 
ORDER BY created_at DESC 
LIMIT 1;
```

#### Test 2: Vérifier les permissions
```sql
-- Teste si tu peux lire les produits
SELECT * FROM products LIMIT 5;
```

#### Test 3: Vérifier le profil
```sql
-- Vérifie que ton profil existe
SELECT * FROM profiles WHERE id = 'ton-user-id';
```

### 7. Solutions Rapides

#### Solution 1: Recharger la page
Après publication, recharge manuellement la page (F5)

#### Solution 2: Vider le cache
1. Ouvre DevTools (F12)
2. Clic droit sur le bouton refresh
3. "Empty Cache and Hard Reload"

#### Solution 3: Vérifier l'authentification
```javascript
// Dans la console du navigateur
console.log(supabase.auth.getUser());
```

### 8. Logs à Fournir

Si le problème persiste, fournis ces informations :

1. **Console logs** (copie tous les messages)
2. **Erreurs Supabase** (dans le dashboard > Logs)
3. **Résultat de cette requête SQL:**
```sql
SELECT 
  p.*,
  pr.username,
  pr.avatar_url
FROM products p
LEFT JOIN profiles pr ON pr.id = p.user_id
ORDER BY p.created_at DESC
LIMIT 5;
```

### 9. Checklist Rapide

- [ ] Le fichier s'est bien uploadé dans Storage
- [ ] Le produit existe dans la table `products`
- [ ] Mon profil existe dans la table `profiles`
- [ ] Les policies RLS sont actives
- [ ] La console ne montre pas d'erreur
- [ ] J'ai rechargé la page après publication
- [ ] Le bucket `products` est public

### 10. Commandes Utiles

```bash
# Vérifier les variables d'environnement
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Relancer le serveur dev
npm run dev

# Vérifier les erreurs TypeScript
npm run typecheck
```

## Contact

Si rien ne fonctionne, fournis :
1. Les logs de la console
2. Une capture d'écran de la table `products` dans Supabase
3. Le message d'erreur exact (si présent)
