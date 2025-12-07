# 🔧 FIX CORS SUPABASE - GUIDE RAPIDE

## 🚨 PROBLÈME

```
Blocage d'une requête multiorigine (Cross-Origin Request)
https://yqsxevpqeapjwsdcryxy.supabase.co/auth/v1/token
Raison : échec de la requête CORS
```

**Impact**: Impossible de se connecter/s'inscrire

---

## ✅ SOLUTION (2 MINUTES)

### Étape 1: Ouvrir Supabase Dashboard

1. Aller sur https://supabase.com/dashboard
2. Se connecter
3. Sélectionner votre projet

### Étape 2: Configuration Authentication

1. Menu gauche → **Authentication**
2. Onglet **URL Configuration**
3. Modifier les champs suivants:

#### Site URL
```
https://s-m-flame.vercel.app
```

#### Additional Redirect URLs
Ajouter (une par ligne):
```
https://s-m-flame.vercel.app
https://s-m-flame.vercel.app/**
https://s-m-flame.vercel.app/auth/callback
http://localhost:5173
http://localhost:5173/**
```

4. Cliquer **Save**

### Étape 3: Vérifier les CORS (Optionnel)

1. Menu gauche → **Settings**
2. **API**
3. Section **CORS**
4. Vérifier que c'est configuré:

```
Allowed origins: *
```

Ou spécifiquement:
```
https://s-m-flame.vercel.app
http://localhost:5173
```

### Étape 4: Attendre & Tester

1. **Attendre 1-2 minutes** (propagation des changements)
2. Vider le cache navigateur (Ctrl+Shift+Delete)
3. Recharger l'app (Ctrl+F5)
4. Tester signup/login

---

## 🧪 TESTS DE VÉRIFICATION

### Test 1: Signup
```
1. Ouvrir https://s-m-flame.vercel.app
2. Cliquer "Sign Up"
3. Remplir le formulaire
4. Soumettre
5. ✅ Devrait créer le compte sans erreur
```

### Test 2: Login
```
1. Cliquer "Login"
2. Entrer email/password
3. Soumettre
4. ✅ Devrait se connecter sans erreur
```

### Test 3: Console
```
1. Ouvrir DevTools (F12)
2. Onglet Console
3. Recharger la page
4. ✅ Aucune erreur CORS
```

---

## 📸 CAPTURES D'ÉCRAN

### Configuration correcte

**Site URL**:
```
┌─────────────────────────────────────────┐
│ Site URL                                │
│ https://s-m-flame.vercel.app           │
└─────────────────────────────────────────┘
```

**Redirect URLs**:
```
┌─────────────────────────────────────────┐
│ Additional Redirect URLs                │
│ https://s-m-flame.vercel.app           │
│ https://s-m-flame.vercel.app/**        │
│ https://s-m-flame.vercel.app/auth/...  │
│ http://localhost:5173                   │
│ http://localhost:5173/**                │
└─────────────────────────────────────────┘
```

---

## 🆘 TROUBLESHOOTING

### Problème: Toujours l'erreur CORS

**Solution 1**: Vider complètement le cache
```
Chrome:
1. F12 → Network
2. Clic droit → Clear browser cache
3. Cocher "Disable cache"
4. Recharger (Ctrl+F5)
```

**Solution 2**: Tester en navigation privée
```
Chrome: Ctrl+Shift+N
Firefox: Ctrl+Shift+P
```

**Solution 3**: Vérifier les variables d'environnement
```
Vercel Dashboard → Settings → Environment Variables

VITE_SUPABASE_URL doit correspondre exactement à:
https://yqsxevpqeapjwsdcryxy.supabase.co
```

**Solution 4**: Redéployer
```
Vercel Dashboard → Deployments → ... → Redeploy
```

### Problème: Erreur 503

**Cause**: Service Supabase temporairement indisponible

**Solution**: Attendre 1-2 minutes et réessayer

### Problème: Token expired

**Cause**: Session expirée

**Solution**: Se déconnecter et se reconnecter

---

## 📋 CHECKLIST COMPLÈTE

### Configuration Supabase
- [ ] Site URL configuré
- [ ] Redirect URLs ajoutées (5 URLs)
- [ ] CORS vérifié
- [ ] Changements sauvegardés
- [ ] Attendu 1-2 minutes

### Test Navigateur
- [ ] Cache vidé
- [ ] Page rechargée (Ctrl+F5)
- [ ] DevTools ouvert (F12)
- [ ] Console vérifiée

### Tests Fonctionnels
- [ ] Signup fonctionne
- [ ] Login fonctionne
- [ ] Aucune erreur CORS
- [ ] Session persiste

---

## 🎯 URLS À CONFIGURER

### Production
```
https://s-m-flame.vercel.app
https://s-m-flame.vercel.app/**
https://s-m-flame.vercel.app/auth/callback
```

### Développement (Optionnel)
```
http://localhost:5173
http://localhost:5173/**
http://localhost:4173
http://localhost:4173/**
```

### Preview Vercel (Optionnel)
```
https://*.vercel.app
```

---

## ✅ RÉSULTAT ATTENDU

### Avant
```
❌ CORS Error
❌ Cannot signup
❌ Cannot login
❌ 503 Service Unavailable
```

### Après
```
✅ No CORS Error
✅ Signup works
✅ Login works
✅ Session persists
```

---

## 📞 SUPPORT

Si le problème persiste après avoir suivi ce guide:

1. Vérifier le status Supabase: https://status.supabase.com
2. Vérifier les logs Supabase: Dashboard → Logs
3. Vérifier les logs Vercel: Dashboard → Deployments → Logs
4. Contacter le support Supabase si nécessaire

---

**Date**: 2025-01-20
**Temps de fix**: 2 minutes
**Priorité**: 🔴 CRITIQUE
**Difficulté**: ⭐ Facile

🚀 **APRÈS CE FIX, L'APP FONCTIONNERA PARFAITEMENT!** 🚀
