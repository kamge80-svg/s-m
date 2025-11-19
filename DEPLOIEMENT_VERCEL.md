# 🚀 Guide de déploiement sur Vercel

## Étape 1 : Préparer le code

### 1.1 Créer .gitignore (si pas déjà fait)

Vérifiez que vous avez un fichier `.gitignore` avec :
```
node_modules
dist
.env
.DS_Store
```

### 1.2 Créer vercel.json

Créez ce fichier pour la configuration :
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Étape 2 : Créer un compte GitHub

1. **Allez sur** https://github.com
2. **Créez un compte** (gratuit)
3. **Vérifiez** votre email

---

## Étape 3 : Créer un repository GitHub

1. **Cliquez** sur le **+** en haut à droite
2. **New repository**
3. **Nom** : `sim-app` (ou autre)
4. **Public** ou **Private** (votre choix)
5. **Ne cochez rien** (pas de README, pas de .gitignore)
6. **Create repository**

---

## Étape 4 : Pousser votre code sur GitHub

Ouvrez le terminal dans votre projet et exécutez :

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "sîm app complete"

# Renommer la branche en main
git branch -M main

# Ajouter le remote (remplacez USERNAME et REPO)
git remote add origin https://github.com/USERNAME/sim-app.git

# Pousser le code
git push -u origin main
```

**Remplacez** `USERNAME` par votre nom d'utilisateur GitHub !

---

## Étape 5 : Créer un compte Vercel

1. **Allez sur** https://vercel.com
2. **Cliquez** sur "Sign Up"
3. **Choisissez** "Continue with GitHub"
4. **Autorisez** Vercel à accéder à GitHub

---

## Étape 6 : Déployer sur Vercel

1. **Sur Vercel**, cliquez sur **"Add New..."** > **"Project"**
2. **Importez** votre repository GitHub `sim-app`
3. **Cliquez** sur "Import"

### 6.1 Configuration du projet

- **Framework Preset** : Vite (détecté automatiquement)
- **Build Command** : `npm run build` (déjà rempli)
- **Output Directory** : `dist` (déjà rempli)

### 6.2 Variables d'environnement

**Cliquez** sur "Environment Variables" et ajoutez :

```
VITE_SUPABASE_URL = https://yqsxevpqeapjwsdcryxy.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlxc3hldnBxZWFwandzZGNyeXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzOTkwODIsImV4cCI6MjA3ODk3NTA4Mn0.diPbgAZOfuGCj4PtUySxCaPdn3rfjU3wttq4k4IyL1c
VITE_STRIPE_PUBLISHABLE_KEY = pk_test_51SUpWTBFtf5eebIVKLqq5ZhHsqXvQGZtZt2jPXl9K0clWXN5Y57iQBg9jY9nHvXmiKpyqnnWMkNkQ4Yto6EcFvht00L3ho8dUM
```

### 6.3 Déployer

**Cliquez** sur **"Deploy"**

⏳ Attendez 2-3 minutes...

✅ **Déploiement terminé !**

Vous obtenez une URL : `https://sim-app.vercel.app`

---

## Étape 7 : Installer sur Android

1. **Ouvrez** `https://sim-app.vercel.app` dans **Chrome** sur votre téléphone
2. **Menu** (⋮) en haut à droite
3. **"Ajouter à l'écran d'accueil"**
4. **Confirmez**
5. **L'icône sîm apparaît** sur votre écran d'accueil ! 🎉

---

## Étape 8 : Installer sur iPhone

1. **Ouvrez** `https://sim-app.vercel.app` dans **Safari**
2. **Bouton Partager** 📤 (en bas)
3. **"Sur l'écran d'accueil"**
4. **Ajouter**
5. **L'icône sîm apparaît** ! 🎉

---

## 🎯 Résumé rapide

```bash
# 1. Créer repo GitHub
# 2. Pousser le code
git init
git add .
git commit -m "sîm app"
git branch -M main
git remote add origin https://github.com/USERNAME/sim-app.git
git push -u origin main

# 3. Aller sur vercel.com
# 4. Import GitHub repo
# 5. Ajouter variables d'environnement
# 6. Deploy
# 7. Ouvrir URL sur téléphone
# 8. Ajouter à l'écran d'accueil
```

---

## 🆘 Problèmes courants

### "Git n'est pas reconnu"
Installez Git : https://git-scm.com/download/win

### "Permission denied (GitHub)"
Utilisez un token : https://github.com/settings/tokens

### "Build failed sur Vercel"
Vérifiez que `npm run build` fonctionne localement

---

## ✨ Bonus : URL personnalisée

Sur Vercel, vous pouvez avoir :
- `sim-app.vercel.app` (gratuit)
- `sim.com` (avec domaine personnalisé)

---

## 🎉 Résultat final

Une fois déployé :
- ✅ Accessible partout : `https://sim-app.vercel.app`
- ✅ Installable sur Android et iPhone
- ✅ Fonctionne comme une vraie app
- ✅ Icône sîm sur l'écran d'accueil
- ✅ Notifications push (si configurées)
- ✅ Fonctionne hors ligne

**Votre app sîm sera accessible dans le monde entier !** 🌍🚀
