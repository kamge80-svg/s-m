# 🚀 Guide de Configuration Finale

## Étape 1 : Créer les icônes PWA

### Option A : Utiliser un générateur en ligne (Recommandé)

1. Allez sur https://www.pwabuilder.com/imageGenerator
2. Uploadez votre logo (minimum 512x512px)
3. Téléchargez les icônes générées
4. Placez `icon-192.png` et `icon-512.png` dans le dossier `public/`

### Option B : Créer manuellement avec un outil

**Avec Photoshop/GIMP/Figma :**
1. Créez une image carrée 512x512px
2. Ajoutez votre logo/design
3. Exportez en PNG :
   - `icon-512.png` (512x512)
   - `icon-192.png` (192x192) - redimensionnez la version 512

**Avec ImageMagick (ligne de commande) :**
```bash
# Si vous avez déjà une image logo.png
convert logo.png -resize 512x512 public/icon-512.png
convert logo.png -resize 192x192 public/icon-192.png
```

### Option C : Utiliser un placeholder temporaire

Créez des icônes simples avec du texte :

```bash
# Windows PowerShell
# Téléchargez une icône placeholder depuis https://via.placeholder.com/
curl -o public/icon-192.png https://via.placeholder.com/192/EAB308/FFFFFF?text=M
curl -o public/icon-512.png https://via.placeholder.com/512/EAB308/FFFFFF?text=M
```

## Étape 2 : Appliquer les migrations SQL dans Supabase

### 2.1 Accéder à Supabase Dashboard

1. Allez sur https://supabase.com/dashboard
2. Connectez-vous à votre compte
3. Sélectionnez votre projet

### 2.2 Ouvrir SQL Editor

1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New Query**

### 2.3 Exécuter les migrations dans l'ordre

**Migration 1 : Notifications et Messages**

1. Ouvrez le fichier `supabase/migrations/add_notifications_and_messages.sql`
2. Copiez tout le contenu
3. Collez dans SQL Editor
4. Cliquez sur **Run** (ou F5)
5. Vérifiez qu'il n'y a pas d'erreurs

**Migration 2 : Reviews et Catégories**

1. Ouvrez le fichier `supabase/migrations/add_reviews_and_categories.sql`
2. Copiez tout le contenu
3. Collez dans SQL Editor
4. Cliquez sur **Run** (ou F5)
5. Vérifiez qu'il n'y a pas d'erreurs

**Migration 3 : Purchases (si pas déjà fait)**

1. Ouvrez le fichier `supabase/migrations/add_purchases_table.sql`
2. Copiez tout le contenu
3. Collez dans SQL Editor
4. Cliquez sur **Run** (ou F5)

### 2.4 Vérifier les tables créées

1. Allez dans **Table Editor**
2. Vérifiez que ces tables existent :
   - ✅ notifications
   - ✅ messages
   - ✅ conversations
   - ✅ reviews
   - ✅ product_analytics
   - ✅ purchases

## Étape 3 : Activer Realtime

### 3.1 Accéder aux paramètres Realtime

1. Dans Supabase Dashboard, allez dans **Database**
2. Cliquez sur **Replication** (dans le menu de gauche)

### 3.2 Activer la réplication pour les tables

Activez la réplication pour ces tables :

- ✅ **notifications** - Pour les notifications en temps réel
- ✅ **messages** - Pour le chat en temps réel
- ✅ **conversations** - Pour la liste des conversations
- ✅ **reviews** - Pour les avis en temps réel
- ✅ **likes** - Pour les likes en temps réel
- ✅ **comments** - Pour les commentaires en temps réel

**Comment activer :**
1. Trouvez la table dans la liste
2. Cliquez sur le toggle à droite
3. Confirmez l'activation

## Étape 4 : Tester le PWA

### 4.1 Build de production

```bash
npm run build
```

Cette commande crée un dossier `dist/` avec votre application optimisée.

### 4.2 Prévisualiser en local

```bash
npm run preview
```

Cela lance un serveur local avec la version de production.

### 4.3 Tester l'installation PWA

1. Ouvrez l'URL affichée (généralement http://localhost:4173)
2. Dans Chrome/Edge :
   - Cliquez sur l'icône ⊕ dans la barre d'adresse
   - Ou cliquez sur le bouton "Install App" qui apparaît
3. L'application s'installe comme une app native !

### 4.4 Tester hors ligne

1. Ouvrez l'app installée
2. Ouvrez DevTools (F12)
3. Allez dans l'onglet **Network**
4. Cochez **Offline**
5. Rechargez la page
6. L'app devrait fonctionner grâce au cache !

## Étape 5 : Déploiement en production

### Option A : Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Suivre les instructions
```

### Option B : Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Déployer
netlify deploy --prod

# Sélectionner le dossier dist/
```

### Option C : GitHub Pages

1. Ajoutez dans `vite.config.ts` :
```typescript
export default defineConfig({
  base: '/nom-du-repo/',
  // ...
})
```

2. Build et déployez :
```bash
npm run build
git add dist -f
git commit -m "Deploy"
git subtree push --prefix dist origin gh-pages
```

## Étape 6 : Configuration finale Stripe (Optionnel)

### 6.1 Redéployer la fonction Edge

```bash
# Si vous avez Supabase CLI
supabase functions deploy create-payment-intent
```

### 6.2 Ou via Dashboard

1. Allez dans **Edge Functions**
2. Cliquez sur **Deploy a new function**
3. Uploadez le code de `supabase/functions/create-payment-intent/index.ts`

## Vérification finale

### Checklist complète

- [ ] Icônes PWA créées (192px et 512px)
- [ ] Migration SQL 1 appliquée (notifications/messages)
- [ ] Migration SQL 2 appliquée (reviews/catégories)
- [ ] Migration SQL 3 appliquée (purchases)
- [ ] Realtime activé pour toutes les tables
- [ ] Build de production réussi (`npm run build`)
- [ ] Preview testé (`npm run preview`)
- [ ] Installation PWA testée
- [ ] Mode hors ligne testé
- [ ] Clé Stripe publique dans `.env`
- [ ] Clé Stripe secrète dans Supabase Secrets
- [ ] Fonction Edge déployée (si Stripe activé)

## Commandes rapides

```bash
# Développement
npm run dev

# Build de production
npm run build

# Prévisualiser la production
npm run preview

# Vérifier les erreurs TypeScript
npm run type-check

# Linter
npm run lint
```

## Dépannage

### Erreur "Module not found"
```bash
npm install
```

### Erreur de build
```bash
rm -rf node_modules
npm install
npm run build
```

### PWA ne s'installe pas
- Vérifiez que vous êtes en HTTPS (ou localhost)
- Vérifiez que `manifest.json` est accessible
- Vérifiez que les icônes existent

### Realtime ne fonctionne pas
- Vérifiez que la réplication est activée
- Vérifiez les politiques RLS
- Regardez la console pour les erreurs

## Support

- Documentation Supabase : https://supabase.com/docs
- Documentation PWA : https://web.dev/progressive-web-apps/
- Documentation Vite : https://vitejs.dev/

## Félicitations ! 🎉

Votre application est maintenant complète et prête pour la production !
