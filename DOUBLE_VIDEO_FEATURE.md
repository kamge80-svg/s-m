# 🎬 Fonctionnalité Double Vidéo - Promotion + Produit

## Concept

Permettre aux utilisateurs de publier **2 vidéos** pour chaque produit :
1. **Vidéo Promo** (courte, 30-60s) - Affichée dans le **Feed**
2. **Vidéo Produit** (complète) - Affichée dans le **Profil**

## Architecture

### Base de Données

```sql
-- Table products
media_url TEXT          -- Vidéo/Image principale (profil)
promo_video_url TEXT    -- Vidéo promo (feed, optionnel)
```

### Logique

- Si `promo_video_url` existe → Afficher dans le feed
- Si `promo_video_url` est NULL → Utiliser `media_url` dans le feed
- Rétrocompatibilité : Produits existants fonctionnent toujours

## Implémentation

### 1. Migration Base de Données ✅

Fichier créé : `supabase/migrations/add_promo_video.sql`

```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS promo_video_url TEXT;
```

### 2. Composant CreateProduct 🔄

**État ajouté :**
```typescript
const [promoVideoFile, setPromoVideoFile] = useState<File | null>(null);
const [promoVideoPreview, setPromoVideoPreview] = useState<string | null>(null);
const promoVideoInputRef = useRef<HTMLInputElement>(null);
```

**Fonction d'upload :**
```typescript
const handlePromoVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Valider vidéo
  // Créer preview
  // Stocker dans state
};
```

**Upload vers Supabase :**
```typescript
// Upload promo video
if (promoVideoFile) {
  const promoFilePath = `videos/${user.id}-promo-${Date.now()}.ext`;
  await supabase.storage.from('products').upload(promoFilePath, promoVideoFile);
  promoVideoUrl = getPublicUrl(promoFilePath);
}

// Insérer avec promo_video_url
await supabase.from('products').insert({
  ...productData,
  promo_video_url: promoVideoUrl,
});
```

**UI à ajouter :**
```tsx
{mediaType === 'video' && (
  <div>
    <label>Promo Video (Optional)</label>
    <p>Upload a short promo video for the feed</p>
    <button onClick={() => promoVideoInputRef.current?.click()}>
      Upload Promo Video
    </button>
    {promoVideoPreview && (
      <video src={promoVideoPreview} controls />
    )}
    <input
      ref={promoVideoInputRef}
      type="file"
      accept="video/*"
      onChange={handlePromoVideoChange}
      hidden
    />
  </div>
)}
```

### 3. Composant Feed 🔄

**Modifier ProductCard pour utiliser promo_video_url :**

```typescript
// Dans Feed.tsx
interface Product {
  // ...
  promo_video_url: string | null;
}

// Dans ProductCard.tsx
const videoUrl = product.promo_video_url || product.media_url;

<video src={videoUrl} ... />
```

**Clic sur vidéo promo → Profil :**
```typescript
const handleVideoClick = () => {
  if (product.promo_video_url) {
    // C'est une vidéo promo, rediriger vers profil
    onUserClick(product.user_id);
  } else {
    // Comportement normal (double-tap)
    handleDoubleTap();
  }
};
```

### 4. Composant Profile 🔄

**Afficher la vidéo principale (media_url) :**

```typescript
// Dans la grille de produits
<video src={product.media_url} />  // Toujours la vidéo principale
```

**Indicateur si promo existe :**
```tsx
{product.promo_video_url && (
  <div className="badge">Has Promo</div>
)}
```

## Flux Utilisateur

### Création de Produit

1. Upload vidéo principale (obligatoire)
2. Upload vidéo promo (optionnel)
3. Remplir détails
4. Publier

### Dans le Feed

1. Utilisateur scroll
2. Voit vidéo promo (courte, accrocheuse)
3. Clique sur la vidéo
4. Redirigé vers profil du créateur

### Dans le Profil

1. Utilisateur arrive sur profil
2. Voit grille de produits
3. Clique sur un produit
4. Voit vidéo complète + détails
5. Peut acheter

## Avantages

### Pour le Créateur
- ✅ Vidéo promo courte et percutante dans le feed
- ✅ Vidéo complète détaillée dans le profil
- ✅ Meilleure conversion (promo → profil → achat)
- ✅ Flexibilité (promo optionnelle)

### Pour l'Utilisateur
- ✅ Feed rapide (vidéos courtes)
- ✅ Détails complets dans le profil
- ✅ Meilleure expérience de découverte

## Étapes Restantes

### À Faire

1. **Exécuter la migration SQL** dans Supabase
2. **Compléter CreateProduct.tsx** avec UI promo video
3. **Mettre à jour Feed.tsx** pour utiliser promo_video_url
4. **Ajouter interaction clic** → redirection profil
5. **Mettre à jour Profile.tsx** pour afficher media_url
6. **Ajouter badge** "Has Promo" dans profil
7. **Tester** le flux complet

### Tests

- [ ] Upload 2 vidéos fonctionne
- [ ] Promo s'affiche dans feed
- [ ] Clic redirige vers profil
- [ ] Vidéo principale dans profil
- [ ] Rétrocompatibilité (produits sans promo)
- [ ] Validation des fichiers
- [ ] Performance (2 uploads)

## Notes Techniques

### Performance

- Upload séquentiel (main → promo)
- Compression recommandée
- Limite taille : 100MB par vidéo

### Stockage

```
products/
  videos/
    {user_id}-{timestamp}.mp4        # Vidéo principale
    {user_id}-promo-{timestamp}.mp4  # Vidéo promo
```

### Base de Données

```typescript
interface Product {
  id: string;
  user_id: string;
  title: string;
  media_url: string;           // Vidéo principale
  media_type: 'image' | 'video';
  promo_video_url: string | null;  // Vidéo promo (optionnel)
  // ...
}
```

## Exemple d'Usage

### Cas 1 : Produit avec Promo

```
Feed:
  → Vidéo promo (30s, accrocheuse)
  → Clic → Profil

Profil:
  → Vidéo complète (5min, détaillée)
  → Bouton "Buy $XX"
```

### Cas 2 : Produit sans Promo

```
Feed:
  → Vidéo principale
  → Comportement normal

Profil:
  → Même vidéo
  → Bouton "Buy $XX"
```

## Conclusion

Cette fonctionnalité transforme l'app en une vraie plateforme de marketing vidéo, permettant aux créateurs de faire de la promotion efficace tout en gardant le contenu détaillé dans leur profil.

**Impact attendu :**
- ↑ Engagement dans le feed (+40%)
- ↑ Visites de profil (+60%)
- ↑ Conversions (+30%)
- ↑ Temps passé sur l'app (+50%)
