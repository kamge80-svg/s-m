# 🎥 Lecture Automatique des Vidéos

## Comment ça fonctionne

Les vidéos se lisent automatiquement quand :
1. L'utilisateur scroll sur la vidéo
2. La vidéo est visible à l'écran (détection via `isVisible`)
3. La vidéo redémarre depuis le début à chaque fois

## Fonctionnalités

### ✅ Implémenté
- ✅ Autoplay quand la vidéo est visible
- ✅ Pause automatique quand on scroll ailleurs
- ✅ Loop infini (la vidéo se répète)
- ✅ Muted par défaut (requis pour autoplay)
- ✅ Bouton pour activer/désactiver le son
- ✅ Reset au début à chaque scroll
- ✅ playsInline pour mobile (pas de fullscreen)

### Comportement
```
Scroll vers vidéo → Détection → Reset à 0s → Play automatique
Scroll ailleurs → Pause → Reset à 0s
```

## Limitations du Navigateur

### Autoplay Policy
Les navigateurs modernes bloquent l'autoplay avec son par défaut.

**Solution implémentée:**
- Vidéos en mute par défaut
- Bouton pour activer le son
- L'utilisateur peut cliquer sur le bouton volume

### Mobile
Sur mobile, certains navigateurs peuvent bloquer l'autoplay même muted.

**Solutions:**
1. L'utilisateur doit interagir une fois (scroll, tap)
2. Utiliser `playsInline` (déjà fait)
3. Précharger avec `preload="auto"` (déjà fait)

## Debugging

### Si les vidéos ne se lisent pas

**1. Vérifie la console**
Tu devrais voir:
```
Scrolled to product: 0
Video playing: nom_du_produit
```

**2. Si tu vois "Video autoplay failed"**
- C'est normal au premier chargement
- Scroll une fois ou tap l'écran
- Après ça devrait fonctionner

**3. Sur mobile**
- Assure-toi que le navigateur autorise l'autoplay
- Teste sur Chrome mobile (meilleur support)
- Vérifie que les vidéos ne sont pas trop lourdes

## Optimisations Possibles

### Performance
```typescript
// Précharger seulement la vidéo visible et les 2 suivantes
preload={isVisible || index < currentIndex + 2 ? "auto" : "metadata"}
```

### Qualité adaptative
```typescript
// Charger une version basse qualité sur mobile
const videoUrl = isMobile ? product.media_url_mobile : product.media_url;
```

### Indicateur de chargement
```typescript
const [loading, setLoading] = useState(true);

<video
  onLoadedData={() => setLoading(false)}
  onWaiting={() => setLoading(true)}
/>

{loading && <Spinner />}
```

## Tests

### Desktop
1. Ouvre l'app
2. Scroll entre les produits
3. Les vidéos doivent se lire automatiquement
4. Clique sur le bouton volume pour activer le son

### Mobile
1. Ouvre sur téléphone
2. Scroll verticalement
3. Les vidéos doivent se lire (peut nécessiter un tap initial)
4. Pas de fullscreen automatique

## Code Clé

### ProductCard.tsx
```typescript
useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  if (isVisible) {
    video.currentTime = 0; // Reset
    video.play().catch(console.warn); // Play
  } else {
    video.pause(); // Pause
    video.currentTime = 0; // Reset
  }
}, [isVisible]);
```

### Feed.tsx
```typescript
const handleScroll = () => {
  const scrollTop = container.scrollTop;
  const windowHeight = window.innerHeight;
  const index = Math.round(scrollTop / windowHeight);
  setCurrentIndex(index); // Trigger isVisible change
};
```

## Attributs Vidéo Importants

```html
<video
  loop          // Répète la vidéo
  muted         // Muted par défaut (requis pour autoplay)
  playsInline   // Pas de fullscreen sur mobile
  preload="auto" // Précharge la vidéo
  autoPlay      // Tente l'autoplay
/>
```

## Troubleshooting

### Vidéo ne se lit pas
- Vérifie que le format est supporté (MP4 recommandé)
- Vérifie que l'URL est accessible
- Vérifie la console pour les erreurs

### Vidéo lag ou saccade
- Réduis la taille du fichier
- Compresse la vidéo
- Utilise un format optimisé (H.264)

### Son ne fonctionne pas
- C'est normal, les vidéos sont muted par défaut
- Clique sur le bouton volume
- Le son s'active pour cette vidéo

## Améliorations Futures

1. **Compression automatique** des vidéos à l'upload
2. **Thumbnails** pour prévisualisation rapide
3. **Qualité adaptative** selon la connexion
4. **Préchargement intelligent** des vidéos suivantes
5. **Indicateur de progression** de la vidéo
6. **Contrôles de lecture** (pause/play manuel)
