# Guide de test PWA

## ✅ Icônes créées

Les icônes SVG temporaires ont été créées dans `public/` :
- `icon-192.svg` ✅
- `icon-512.svg` ✅

## Comment tester le PWA

### Étape 1 : Build de production

```bash
npm run build
```

### Étape 2 : Lancer le serveur de preview

```bash
npm run preview
```

### Étape 3 : Ouvrir dans Chrome

1. Ouvrez http://localhost:4173 dans **Google Chrome**
2. Attendez quelques secondes

### Étape 4 : Vérifier le PWA

#### Option A : Bouton "Install App"
- Un bouton vert devrait apparaître en bas à droite
- Cliquez dessus pour installer

#### Option B : Menu Chrome
1. Cliquez sur les 3 points (⋮) en haut à droite
2. Cherchez "Installer Marketplace" ou "Install app"
3. Cliquez pour installer

#### Option C : Barre d'adresse
- Une icône ⊕ ou 💻 peut apparaître dans la barre d'adresse
- Cliquez dessus

### Étape 5 : Vérifier dans DevTools

1. Ouvrez DevTools (F12)
2. Allez dans l'onglet **Application**
3. Section **Manifest** :
   - Vérifiez que le manifest se charge
   - Vérifiez que les icônes s'affichent
4. Section **Service Workers** :
   - Vérifiez que le SW est enregistré

## Pourquoi le bouton n'apparaît pas ?

### Raisons courantes :

1. **Mode développement** ❌
   - Solution : Utilisez `npm run build && npm run preview`

2. **Déjà installé** ✅
   - Si vous avez déjà installé l'app, le bouton ne s'affiche plus
   - Désinstallez d'abord : chrome://apps

3. **Navigateur non supporté** ❌
   - Chrome/Edge : ✅ Supporté
   - Firefox : ⚠️ Support limité
   - Safari : ⚠️ Support partiel

4. **Critères PWA non remplis** ❌
   - Manifest valide : ✅
   - Service Worker : ✅
   - HTTPS : ✅ (localhost OK)
   - Icônes : ✅

## Test sur mobile

### Android (Chrome)

1. Ouvrez l'app sur votre téléphone
2. Menu (⋮) > "Ajouter à l'écran d'accueil"
3. L'icône apparaît sur votre écran d'accueil

### iOS (Safari)

1. Ouvrez l'app dans Safari
2. Bouton Partager 📤
3. "Sur l'écran d'accueil"

## Vérification manuelle

### Checklist PWA

- [ ] Manifest.json accessible : http://localhost:4173/manifest.json
- [ ] Service Worker enregistré
- [ ] Icônes présentes
- [ ] HTTPS ou localhost
- [ ] Responsive design
- [ ] Fonctionne hors ligne

### Tester le manifest

```bash
# Vérifier que le manifest est accessible
curl http://localhost:4173/manifest.json
```

### Tester les icônes

```bash
# Vérifier que les icônes existent
curl http://localhost:4173/icon-192.svg
curl http://localhost:4173/icon-512.svg
```

## Désinstaller le PWA

### Chrome Desktop
1. chrome://apps
2. Clic droit sur l'app
3. "Désinstaller"

### Chrome Android
1. Paramètres > Apps
2. Trouvez "Marketplace"
3. Désinstaller

## Alternative : Forcer l'installation

Si le bouton n'apparaît toujours pas, vous pouvez installer manuellement :

### Chrome Desktop
1. Menu (⋮) > Plus d'outils > Créer un raccourci
2. Cochez "Ouvrir dans une fenêtre"
3. Créer

### Lighthouse Test

1. DevTools (F12)
2. Onglet "Lighthouse"
3. Catégorie "Progressive Web App"
4. "Generate report"
5. Vérifiez le score PWA

## Debugging

### Console logs

Ouvrez la console et cherchez :
```
SW registered: ...
```

Si vous voyez des erreurs, partagez-les.

### Manifest errors

Dans DevTools > Application > Manifest, vérifiez :
- Pas d'erreurs rouges
- Les icônes s'affichent
- Le nom est correct

## Prochaines étapes

Une fois le PWA installé :

1. ✅ Testez hors ligne (désactivez le réseau)
2. ✅ Testez les notifications
3. ✅ Vérifiez l'icône sur l'écran d'accueil
4. ✅ Testez le splash screen

## Commandes utiles

```bash
# Build
npm run build

# Preview
npm run preview

# Build + Preview
npm run build && npm run preview

# Nettoyer le cache
rm -rf dist node_modules/.vite
npm run build
```

## Support

Si le PWA ne fonctionne toujours pas :

1. Vérifiez la console pour les erreurs
2. Testez dans un onglet de navigation privée
3. Videz le cache du navigateur
4. Redémarrez le serveur preview
