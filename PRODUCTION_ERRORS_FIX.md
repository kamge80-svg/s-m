# 🔧 FIX ERREURS PRODUCTION

## 🚨 ERREUR CRITIQUE: CORS SUPABASE

### Problème
```
Blocage d'une requête multiorigine (Cross-Origin Request)
Raison : échec de la requête CORS
Code d'état : (null)
```

### Cause
L'URL de production Vercel n'est pas autorisée dans Supabase.

### Solution (URGENT)

#### 1. Autoriser l'URL dans Supabase

**Dashboard Supabase** → Authentication → URL Configuration:

```
Site URL: https://s-m-flame.vercel.app

Redirect URLs (ajouter):
- https://s-m-flame.vercel.app
- https://s-m-flame.vercel.app/**
- https://s-m-flame.vercel.app/auth/callback
```

#### 2. Vérifier les CORS

**Dashboard Supabase** → Settings → API:

Vérifier que CORS est activé pour:
```
Allowed origins: *
(ou spécifiquement: https://s-m-flame.vercel.app)
```

#### 3. Redémarrer l'app

Après modification, attendre 1-2 minutes puis:
- Vider le cache du navigateur (Ctrl+Shift+Delete)
- Recharger l'app (Ctrl+F5)

---

## ⚠️ WARNING: Web Vitals layout-shift

### Problème
```
entryTypes layout-shift ignoré, car non pris en charge
```

### Cause
Certains navigateurs ne supportent pas tous les Web Vitals.

### Solution
Ajouter une vérification de support dans `webVitals.ts`.

---

## ⚠️ WARNING: Stripe Cookies

### Problème
```
Accès partitionné à un cookie Stripe
```

### Cause
Politique de cookies tiers de Firefox/Safari.

### Solution
C'est normal et n'affecte pas le fonctionnement. Stripe gère cela automatiquement.

---

## 🔧 FIXES À APPLIQUER

### Fix 1: Web Vitals (Optionnel)

Mettre à jour `src/utils/webVitals.ts`:

```typescript
// Avant d'observer, vérifier le support
if ('PerformanceObserver' in window) {
  try {
    // Vérifier si layout-shift est supporté
    const supported = PerformanceObserver.supportedEntryTypes;
    
    if (supported && supported.includes('layout-shift')) {
      const clsObserver = new PerformanceObserver((list) => {
        // ... code existant
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  } catch (e) {
    logger.debug('Layout shift observation not supported');
  }
}
```

### Fix 2: Supabase CORS (CRITIQUE)

**Action immédiate**:
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Authentication → URL Configuration
4. Ajouter `https://s-m-flame.vercel.app` partout
5. Sauvegarder
6. Attendre 1-2 minutes
7. Tester à nouveau

---

## ✅ VÉRIFICATION POST-FIX

### Test 1: Authentification
```
1. Ouvrir https://s-m-flame.vercel.app
2. Cliquer "Sign Up"
3. Créer un compte
4. Devrait fonctionner sans erreur CORS
```

### Test 2: Refresh Token
```
1. Se connecter
2. Attendre 5 minutes
3. Rafraîchir la page
4. Devrait rester connecté
```

### Test 3: Console
```
1. Ouvrir DevTools (F12)
2. Console
3. Ne devrait plus voir d'erreur CORS
```

---

## 🚀 COMMANDES RAPIDES

### Vider le cache navigateur
```
Chrome: Ctrl+Shift+Delete → Tout effacer
Firefox: Ctrl+Shift+Delete → Tout effacer
Safari: Cmd+Option+E
```

### Forcer le rechargement
```
Chrome/Firefox: Ctrl+F5
Safari: Cmd+Shift+R
```

---

## 📊 ERREURS PAR PRIORITÉ

### 🔴 CRITIQUE (À fixer immédiatement)
- [x] CORS Supabase → Ajouter URL dans dashboard

### 🟡 WARNING (Peut attendre)
- [ ] Web Vitals layout-shift → Ajouter vérification support
- [ ] Stripe cookies → Rien à faire (normal)

---

## 🆘 SI ÇA NE FONCTIONNE TOUJOURS PAS

### Vérifier les variables d'environnement

**Vercel Dashboard** → Settings → Environment Variables:

```env
VITE_SUPABASE_URL=https://yqsxevpqeapjwsdcryxy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (votre clé)
```

### Vérifier que c'est bien la bonne URL

Dans le code, vérifier:
```typescript
console.log(import.meta.env.VITE_SUPABASE_URL);
// Devrait afficher: https://yqsxevpqeapjwsdcryxy.supabase.co
```

### Redéployer si nécessaire

```bash
# Via Vercel Dashboard
Deployments → ... → Redeploy

# Ou via CLI
vercel --prod
```

---

## ✅ CHECKLIST DE RÉSOLUTION

- [ ] URL ajoutée dans Supabase Authentication
- [ ] CORS vérifié dans Supabase Settings
- [ ] Cache navigateur vidé
- [ ] Page rechargée (Ctrl+F5)
- [ ] Test signup fonctionne
- [ ] Test login fonctionne
- [ ] Aucune erreur CORS dans console

---

**Date**: 2025-01-20
**Status**: 🔧 EN COURS DE FIX
**Priorité**: 🔴 CRITIQUE

⚡ **FIX RAPIDE: 2 MINUTES** ⚡
