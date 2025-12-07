# 🚀 GUIDE DE DÉPLOIEMENT - sîm Marketplace

## 📋 PRÉ-REQUIS

### Comptes nécessaires
- ✅ Compte Vercel (gratuit)
- ✅ Compte Supabase (déjà configuré)
- ✅ Compte Stripe (déjà configuré)
- ⏳ Compte Sentry (optionnel mais recommandé)
- ⏳ Service email (Resend/SendGrid - optionnel)

---

## 🎯 ÉTAPE 1: BUILD LOCAL

Testons d'abord le build en local:

```bash
# 1. Nettoyer les dépendances
npm ci

# 2. Build de production
npm run build

# 3. Preview du build
npm run preview
```

**Vérifications**:
- ✅ Build réussi sans erreurs
- ✅ Preview fonctionne sur http://localhost:4173
- ✅ Taille du bundle < 500 KB
- ✅ Pas d'erreurs console

---

## 🗄️ ÉTAPE 2: MIGRATIONS SUPABASE

Appliquons toutes les migrations:

```bash
# Si Supabase CLI installé
supabase db push

# Sinon, via Dashboard Supabase
# 1. Aller sur https://supabase.com/dashboard
# 2. Sélectionner votre projet
# 3. SQL Editor
# 4. Copier/coller chaque migration
```

**Migrations à appliquer** (dans l'ordre):
1. ✅ `00_initial_setup.sql` (déjà fait)
2. ✅ `add_purchases_table.sql` (déjà fait)
3. ✅ `add_notifications_and_messages.sql` (déjà fait)
4. ✅ `add_reviews_and_categories.sql` (déjà fait)
5. ✅ `add_advanced_products.sql` (déjà fait)
6. ✅ `add_courses_system.sql` (déjà fait)
7. ✅ `add_platform_commission.sql` (déjà fait)
8. ⏳ `add_admin_role.sql` (NOUVEAU)
9. ⏳ `add_email_queue.sql` (NOUVEAU)

**Vérification**:
```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Devrait inclure:
-- - profiles
-- - products
-- - purchases
-- - platform_earnings
-- - email_queue (nouveau)
```

---

## 🌐 ÉTAPE 3: DÉPLOIEMENT VERCEL

### Option A: Via CLI (Recommandé)

```bash
# 1. Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Suivre les prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? sim-marketplace (ou votre choix)
# - Directory? ./
# - Override settings? No

# 5. Deploy en production
vercel --prod
```

### Option B: Via Dashboard Vercel

1. Aller sur https://vercel.com/new
2. Importer votre repo GitHub
3. Configurer:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm ci`
4. Ajouter les variables d'environnement (voir ci-dessous)
5. Cliquer "Deploy"

---

## 🔐 ÉTAPE 4: VARIABLES D'ENVIRONNEMENT

### Variables Vercel (OBLIGATOIRES)

Dans Vercel Dashboard → Settings → Environment Variables:

```env
# Supabase (REQUIS)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe (REQUIS)
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx

# Sentry (OPTIONNEL mais recommandé)
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=production
```

**⚠️ IMPORTANT**: 
- Utiliser les clés LIVE de Stripe en production
- Ne JAMAIS commiter les clés dans Git
- Vérifier que `.env` est dans `.gitignore`

---

## 🔧 ÉTAPE 5: CONFIGURATION POST-DÉPLOIEMENT

### 5.1 Supabase - URL Autorisées

Dans Supabase Dashboard → Authentication → URL Configuration:

```
Site URL: https://your-app.vercel.app
Redirect URLs:
  - https://your-app.vercel.app
  - https://your-app.vercel.app/**
```

### 5.2 Stripe - Webhooks

Dans Stripe Dashboard → Developers → Webhooks:

```
Endpoint URL: https://your-app.vercel.app/api/stripe-webhook
Events to send:
  - payment_intent.succeeded
  - payment_intent.payment_failed
```

### 5.3 Définir les Admins

```sql
-- Via Supabase SQL Editor
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'votre-email@example.com';

-- Vérifier
SELECT id, username, email, is_admin 
FROM profiles 
WHERE is_admin = TRUE;
```

### 5.4 Sentry (Optionnel)

1. Créer compte sur https://sentry.io
2. Créer nouveau projet (React)
3. Copier le DSN
4. Ajouter à Vercel env vars
5. Redéployer

---

## ✅ ÉTAPE 6: VÉRIFICATIONS POST-DÉPLOIEMENT

### Checklist Fonctionnelle

```bash
# 1. Ouvrir l'app en production
https://your-app.vercel.app

# 2. Tester les fonctionnalités critiques:
```

- [ ] **Authentification**
  - [ ] Inscription fonctionne
  - [ ] Login fonctionne
  - [ ] Logout fonctionne

- [ ] **Feed**
  - [ ] Produits s'affichent
  - [ ] Vidéos jouent
  - [ ] Scroll infini fonctionne

- [ ] **Création**
  - [ ] Upload image fonctionne
  - [ ] Upload vidéo fonctionne
  - [ ] Création produit réussit

- [ ] **Paiements**
  - [ ] Modal Stripe s'ouvre
  - [ ] Test card fonctionne (4242 4242 4242 4242)
  - [ ] Achat enregistré dans DB

- [ ] **Admin**
  - [ ] Bouton admin visible
  - [ ] Dashboard s'ouvre
  - [ ] Stats s'affichent

### Checklist Performance

```bash
# 1. Lighthouse Test
# Chrome DevTools → Lighthouse → Analyze page load

Objectifs:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 95+
```

- [ ] **Core Web Vitals**
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

- [ ] **Bundle Size**
  - [ ] Main bundle < 400 KB
  - [ ] Total size < 1 MB

### Checklist Sécurité

- [ ] **HTTPS** activé (automatique avec Vercel)
- [ ] **RLS** activé sur toutes les tables Supabase
- [ ] **API Keys** en variables d'environnement
- [ ] **CORS** configuré correctement
- [ ] **Rate limiting** actif (client-side)

---

## 🐛 ÉTAPE 7: MONITORING

### 7.1 Sentry (Erreurs)

```typescript
// Vérifier que Sentry capture les erreurs
// Tester en production:
throw new Error('Test Sentry Error');

// Vérifier sur https://sentry.io
```

### 7.2 Vercel Analytics

```bash
# Activer dans Vercel Dashboard
Settings → Analytics → Enable

# Voir les métriques:
- Page views
- Unique visitors
- Top pages
- Performance metrics
```

### 7.3 Supabase Logs

```bash
# Dashboard Supabase → Logs
- API logs
- Database logs
- Auth logs
```

---

## 📧 ÉTAPE 8: CONFIGURATION EMAILS (OPTIONNEL)

### Option A: Resend (Recommandé)

```bash
# 1. Créer compte sur https://resend.com
# 2. Obtenir API key
# 3. Créer Edge Function Supabase

# supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { to, subject, html } = await req.json()
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'noreply@yourdomain.com',
      to,
      subject,
      html
    })
  })
  
  return new Response(JSON.stringify(await res.json()), {
    headers: { 'Content-Type': 'application/json' }
  })
})

# 4. Deploy
supabase functions deploy send-email --no-verify-jwt

# 5. Set secret
supabase secrets set RESEND_API_KEY=re_xxx
```

### Option B: SendGrid

Similaire à Resend, utiliser l'API SendGrid.

---

## 🔄 ÉTAPE 9: CI/CD (OPTIONNEL)

### GitHub Actions

Créer `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test # Si vous avez des tests
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📊 ÉTAPE 10: MÉTRIQUES DE SUCCÈS

### Jour 1
- [ ] 0 erreurs critiques
- [ ] Lighthouse > 90
- [ ] Temps de réponse < 1s
- [ ] 0 downtime

### Semaine 1
- [ ] Monitoring actif
- [ ] Premiers utilisateurs
- [ ] Feedback collecté
- [ ] Bugs mineurs fixés

### Mois 1
- [ ] Analytics configurés
- [ ] Email system actif
- [ ] Admin dashboard utilisé
- [ ] Optimisations continues

---

## 🆘 TROUBLESHOOTING

### Problème: Build échoue

```bash
# Solution 1: Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run build

# Solution 2: Vérifier les versions Node
node --version  # Devrait être 18+
npm --version   # Devrait être 9+

# Solution 3: Vérifier les erreurs TypeScript
npm run type-check
```

### Problème: Variables d'environnement non trouvées

```bash
# Vérifier dans Vercel Dashboard
Settings → Environment Variables

# Redéployer après ajout
vercel --prod
```

### Problème: Supabase connection failed

```bash
# Vérifier les URLs autorisées
Supabase Dashboard → Authentication → URL Configuration

# Vérifier les clés
console.log(import.meta.env.VITE_SUPABASE_URL)
```

### Problème: Stripe ne fonctionne pas

```bash
# Vérifier la clé publique
console.log(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

# Vérifier que c'est la clé LIVE (pk_live_xxx)
# Pas la clé TEST (pk_test_xxx)
```

---

## 🎉 DÉPLOIEMENT RÉUSSI!

### Checklist Finale

- [ ] ✅ Build réussi
- [ ] ✅ Migrations appliquées
- [ ] ✅ Déployé sur Vercel
- [ ] ✅ Variables d'environnement configurées
- [ ] ✅ URLs Supabase autorisées
- [ ] ✅ Admins définis
- [ ] ✅ Tests fonctionnels passés
- [ ] ✅ Lighthouse > 90
- [ ] ✅ Monitoring actif
- [ ] ✅ Emails configurés (optionnel)

### URLs Importantes

```
Production: https://your-app.vercel.app
Vercel Dashboard: https://vercel.com/dashboard
Supabase Dashboard: https://supabase.com/dashboard
Stripe Dashboard: https://dashboard.stripe.com
Sentry Dashboard: https://sentry.io (si configuré)
```

---

## 📞 SUPPORT

### Ressources
- Documentation Vercel: https://vercel.com/docs
- Documentation Supabase: https://supabase.com/docs
- Documentation Stripe: https://stripe.com/docs
- GitHub Issues: https://github.com/your-repo/issues

### Prochaines Étapes
1. Monitorer les premières 24h
2. Collecter feedback utilisateurs
3. Optimiser selon les métriques
4. Ajouter features progressivement

---

**Date**: 2025-01-20
**Version**: 1.0.0
**Status**: ✅ PRÊT POUR PRODUCTION

🚀 **BON LANCEMENT!** 🚀
