# Guide de création des icônes PWA

## Méthode 1 : Outil en ligne (Plus simple)

### PWA Builder Image Generator
1. Allez sur https://www.pwabuilder.com/imageGenerator
2. Uploadez votre logo (minimum 512x512px)
3. Téléchargez le package d'icônes
4. Copiez `icon-192.png` et `icon-512.png` dans `public/`

### Favicon.io
1. Allez sur https://favicon.io/favicon-converter/
2. Uploadez votre image
3. Téléchargez et extrayez
4. Renommez les fichiers appropriés

## Méthode 2 : Avec Photoshop/GIMP

### Créer icon-512.png
1. Créez un nouveau document 512x512px
2. Fond transparent ou couleur unie
3. Ajoutez votre logo centré
4. Exportez en PNG : `icon-512.png`

### Créer icon-192.png
1. Redimensionnez l'image 512x512 à 192x192
2. Exportez en PNG : `icon-192.png`

## Méthode 3 : Avec ImageMagick (Ligne de commande)

Si vous avez ImageMagick installé :

```bash
# Redimensionner une image existante
magick convert logo.png -resize 512x512 public/icon-512.png
magick convert logo.png -resize 192x192 public/icon-192.png
```

## Méthode 4 : Utiliser un placeholder temporaire

Pour tester rapidement, créez des icônes simples :

### Avec Canvas (Node.js)
```bash
npm install canvas
node create-icons.js
```

Créez `create-icons.js` :
```javascript
const { createCanvas } = require('canvas');
const fs = require('fs');

function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#EAB308');
  gradient.addColorStop(1, '#22C55E');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size/3}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M', size/2, size/2);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
}

createIcon(192, 'public/icon-192.png');
createIcon(512, 'public/icon-512.png');
console.log('Icons created!');
```

## Méthode 5 : Utiliser un service de design

### Canva (Gratuit)
1. Allez sur https://www.canva.com
2. Créez un design 512x512px
3. Ajoutez votre logo/texte
4. Téléchargez en PNG
5. Redimensionnez pour 192x192

### Figma (Gratuit)
1. Créez un frame 512x512
2. Designez votre icône
3. Exportez en PNG @1x et @2x

## Spécifications des icônes

### icon-192.png
- **Taille** : 192x192 pixels
- **Format** : PNG
- **Utilisation** : Écran d'accueil Android, notifications

### icon-512.png
- **Taille** : 512x512 pixels
- **Format** : PNG
- **Utilisation** : Splash screen, haute résolution

## Recommandations de design

### Bonnes pratiques
- ✅ Utilisez un fond de couleur unie ou transparent
- ✅ Centrez votre logo
- ✅ Laissez une marge de 10% sur les bords
- ✅ Utilisez des couleurs contrastées
- ✅ Testez sur fond clair et foncé

### À éviter
- ❌ Texte trop petit
- ❌ Détails trop fins
- ❌ Coins arrondis (l'OS les gère)
- ❌ Ombres portées excessives

## Placement des fichiers

```
project/
├── public/
│   ├── icon-192.png  ← Placez ici
│   ├── icon-512.png  ← Placez ici
│   ├── manifest.json
│   └── sw.js
```

## Vérification

Après avoir placé les icônes :

1. **Vérifiez qu'elles existent** :
   ```bash
   ls public/icon-*.png
   ```

2. **Testez le manifest** :
   - Ouvrez DevTools (F12)
   - Onglet "Application"
   - Section "Manifest"
   - Vérifiez que les icônes s'affichent

3. **Testez l'installation** :
   ```bash
   npm run build
   npm run preview
   ```
   - Ouvrez dans Chrome
   - Cherchez le bouton "Install"

## Icônes temporaires

Si vous voulez juste tester, utilisez ces emojis comme placeholder :

### Créer avec emoji (rapide)
1. Allez sur https://emoji-to-png.com/
2. Choisissez un emoji (🛒, 💎, 🎨, etc.)
3. Téléchargez en 192px et 512px
4. Renommez et placez dans `public/`

## Ressources

- **PWA Builder** : https://www.pwabuilder.com/imageGenerator
- **Favicon.io** : https://favicon.io/
- **Canva** : https://www.canva.com
- **Figma** : https://www.figma.com
- **Emoji to PNG** : https://emoji-to-png.com/

## Exemple de couleurs pour votre app

Basé sur votre thème actuel (jaune/vert) :
- **Couleur principale** : #EAB308 (jaune)
- **Couleur secondaire** : #22C55E (vert)
- **Fond** : Dégradé jaune → vert
- **Texte/Logo** : Blanc (#FFFFFF)

## Prochaines étapes

1. ✅ Créez les icônes
2. ✅ Placez-les dans `public/`
3. ✅ Testez avec `npm run build && npm run preview`
4. ✅ Vérifiez dans Chrome DevTools
5. ✅ Testez l'installation sur mobile
