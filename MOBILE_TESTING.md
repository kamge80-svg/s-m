# 📱 Tester sur Téléphone

## Méthode 1: Réseau Local (Recommandé)

### Étape 1: Redémarre le serveur
```bash
# Arrête le serveur actuel (Ctrl+C)
# Puis relance
npm run dev
```

### Étape 2: Trouve ton adresse IP locale

**Sur Windows:**
```bash
ipconfig
```
Cherche "Adresse IPv4" (exemple: 192.168.1.100)

**Sur Mac/Linux:**
```bash
ifconfig | grep "inet "
```
ou
```bash
ip addr show
```

### Étape 3: Note l'URL affichée
Quand tu lances `npm run dev`, tu verras quelque chose comme:
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

### Étape 4: Sur ton téléphone
1. Assure-toi que ton téléphone est sur le **même WiFi** que ton ordinateur
2. Ouvre le navigateur de ton téléphone
3. Va sur l'adresse Network (exemple: http://192.168.1.100:5173/)

## Méthode 2: Tunnel avec ngrok (Si même WiFi ne fonctionne pas)

### Installation ngrok
1. Va sur https://ngrok.com/
2. Crée un compte gratuit
3. Télécharge ngrok
4. Installe-le

### Utilisation
```bash
# Dans un nouveau terminal
ngrok http 5173
```

Tu verras une URL comme: `https://abc123.ngrok.io`

Utilise cette URL sur ton téléphone !

## Méthode 3: Déploiement (Pour test permanent)

### Option A: Vercel (Gratuit, Recommandé)
```bash
# Installe Vercel CLI
npm i -g vercel

# Déploie
vercel
```

### Option B: Netlify (Gratuit)
```bash
# Build
npm run build

# Installe Netlify CLI
npm i -g netlify-cli

# Déploie
netlify deploy --prod
```

## 🔧 Problèmes Courants

### "Cannot connect" sur téléphone
**Solutions:**
1. Vérifie que tu es sur le même WiFi
2. Désactive le pare-feu Windows temporairement
3. Vérifie que le port 5173 n'est pas bloqué

### Pare-feu Windows
```powershell
# Exécute en tant qu'administrateur
netsh advfirewall firewall add rule name="Vite Dev Server" dir=in action=allow protocol=TCP localport=5173
```

### "ERR_CONNECTION_REFUSED"
- Assure-toi que le serveur tourne (`npm run dev`)
- Vérifie l'adresse IP (elle peut changer)
- Redémarre le serveur

## 📊 Vérification Rapide

### Sur ton ordinateur:
1. Le serveur affiche "Network: http://X.X.X.X:5173/"
2. Tu peux accéder à http://localhost:5173/

### Sur ton téléphone:
1. Même WiFi que l'ordinateur ✓
2. Utilise l'adresse Network (pas localhost)
3. Le navigateur charge la page

## 🎯 Commandes Utiles

```bash
# Voir ton IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Redémarrer le serveur
npm run dev

# Build pour production
npm run build

# Preview du build
npm run preview
```

## 💡 Conseils

1. **Utilise Chrome sur mobile** pour les DevTools
2. **Active le mode responsive** sur desktop d'abord
3. **Teste sur plusieurs tailles** d'écran
4. **Vérifie les performances** sur mobile (plus lent)

## 🚀 Après les Tests

Une fois satisfait, déploie en production:

```bash
# Build
npm run build

# Déploie sur Vercel
vercel --prod
```

Ton app sera accessible partout avec une vraie URL !
