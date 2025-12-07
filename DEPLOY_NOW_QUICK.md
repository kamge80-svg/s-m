# 🚀 DÉPLOIEMENT RAPIDE - 5 MINUTES

## ✅ PRÉ-REQUIS VÉRIFIÉS

- [x] Build réussi (8.54s)
- [x] Bundle optimisé (160 KB gzipped)
- [x] Code pushed sur GitHub
- [x] Supabase configuré
- [x] Stripe configuré

---

## 🎯 OPTION 1: VERCEL (RECOMMANDÉ)

### Étape 1: Connecter GitHub (2 min)

1. Aller sur https://vercel.com/new
2. Cliquer "Import Git Repository"
3. Sélectionner votre repo `s-m`
4. Cliquer "Import"

### Étape 2: Configuration (2 min)

**Framework Preset**: Vite (détecté automatiquement)

**Build Settings**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm ci`

**Environment Variables** (IMPORTANT):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
```

### Étape 3: Deploy (1 min)

1. Cliquer "Deploy"
2. Attendre ~2 minutes
3. ✅ Déployé!

**URL**: `https://your-project.vercel.app`

---

## 🔧 POST-DÉPLOIEMENT (2 MIN)

### 1. Autoriser l'URL dans Supabase

Dashboard Supabase → Authentication → URL Configuration:
```
Site URL: https://your-project.vercel.app
Redirect URLs: https://your-project.vercel.app/**
```

### 2. Définir un Admin

SQL Editor Supabase:
```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'votre-email@example.com';
```

### 3. Tester

1. Ouvrir `https://your-project.vercel.app`
2. Créer un compte
3. Tester le feed
4. Tester un achat (carte test: 4242 4242 4242 4242)

---

## ✅ CHECKLIST RAPIDE

- [ ] Vercel connecté à GitHub
- [ ] Variables d'environnement ajoutées
- [ ] Déployé avec succès
- [ ] URL Supabase autorisée
- [ ] Admin défini
- [ ] Test signup ✅
- [ ] Test feed ✅
- [ ] Test achat ✅

---

## 🎉 C'EST FAIT!

**Votre app est en ligne!**

URL: `https://your-project.vercel.app`

### Prochaines Étapes

1. Partager l'URL
2. Collecter feedback
3. Monitorer Vercel Analytics
4. Optimiser selon usage

---

## 🆘 PROBLÈMES?

### Build échoue
```bash
# Localement
npm ci
npm run build

# Si ça marche, redéployer
```

### Variables d'environnement
```bash
# Vérifier dans Vercel
Settings → Environment Variables

# Redéployer après ajout
Deployments → ... → Redeploy
```

### Supabase connection
```bash
# Vérifier les URLs autorisées
Supabase → Authentication → URL Configuration
```

---

**Temps total**: ~5 minutes
**Difficulté**: Facile
**Status**: ✅ PRÊT

🚀 **GO LIVE!** 🚀
