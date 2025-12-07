# 🛍️ S&M Frame - Plateforme E-Commerce & E-Learning

[![Déployé sur Vercel](https://img.shields.io/badge/Vercel-Déployé-success)](https://s-m-frame.vercel.app)
[![Supabase](https://img.shields.io/badge/Supabase-Actif-green)](https://supabase.com)
[![Stripe](https://img.shields.io/badge/Stripe-Intégré-blue)](https://stripe.com)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org)

Plateforme complète combinant e-commerce et e-learning avec système de paiement Stripe et commission automatisée.

## 🌟 Fonctionnalités

### 📱 E-Commerce (Phase 1)
- ✅ Création et gestion de produits (images/vidéos)
- ✅ Feed infini avec vidéos auto-play
- ✅ Système de likes, commentaires, partages
- ✅ Bookmarks et favoris
- ✅ Catégories et recherche
- ✅ Codes promo et bundles
- ✅ Paiements Stripe sécurisés
- ✅ Historique d'achats
- ✅ Analytics vendeur
- ✅ Notifications en temps réel
- ✅ Messagerie intégrée

### 🎓 E-Learning (Phase 2)
- ✅ Création de cours avec leçons
- ✅ Quiz et évaluations
- ✅ Certificats automatiques
- ✅ Progression tracking
- ✅ Vidéos de cours
- ✅ Ressources téléchargeables

### 💰 Système de Commission
- ✅ **7% plateforme / 93% vendeur**
- ✅ Calcul automatique côté serveur
- ✅ Tracking quotidien des revenus
- ✅ Trigger SQL automatisé
- ✅ Métadonnées Stripe complètes

### 🎨 Interface
- ✅ Design moderne avec Tailwind CSS
- ✅ Animations fluides
- ✅ Responsive mobile-first
- ✅ Dark mode par défaut
- ✅ PWA (Progressive Web App)
- ✅ Accessibilité (ARIA)

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase
- Compte Stripe

### Installation

```bash
# Cloner le repo
git clone https://github.com/kamge80-svg/s-m.git
cd s-m

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés

# Lancer en développement
npm run dev

# Build production
npm run build
```

### Configuration

#### 1. Supabase
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

#### 2. Stripe
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### 3. Appliquer les migrations
```sql
-- Dans Supabase SQL Editor
-- Exécuter les fichiers dans supabase/migrations/
```

## 📊 Architecture

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le styling
- **Vite** comme bundler
- **React Router** (hash-based)

### Backend
- **Supabase** (PostgreSQL + Auth + Storage)
- **Edge Functions** pour logique serveur
- **Row Level Security** (RLS)
- **Triggers SQL** pour automatisation

### Paiements
- **Stripe Payment Intents**
- **Commission 7%/93%** automatisée
- **Webhooks** pour confirmation

### Déploiement
- **Vercel** pour le frontend
- **Supabase** pour le backend
- **Auto-deploy** depuis GitHub

## 📁 Structure du Projet

```
s-m/
├── src/
│   ├── components/        # Composants React
│   ├── contexts/          # Context API
│   ├── services/          # Services (Stripe, etc.)
│   ├── utils/             # Utilitaires
│   ├── pages/             # Pages
│   ├── App.tsx            # App principale
│   └── main.tsx           # Point d'entrée
├── supabase/
│   ├── migrations/        # Migrations SQL
│   └── functions/         # Edge Functions
├── public/                # Assets statiques
└── docs/                  # Documentation
```

## 🗄️ Base de Données

### Tables Principales
- `profiles` - Profils utilisateurs
- `products` - Produits e-commerce
- `courses` - Cours e-learning
- `purchases` - Achats avec commission
- `platform_earnings` - Revenus plateforme
- `promo_codes` - Codes promotionnels
- `bundles` - Packs de produits
- `notifications` - Notifications
- `messages` - Messagerie

**Total**: 30+ tables

## 💳 Système de Paiement

### Commission
```
Prix produit: 100.00 $
├── Plateforme (7%): 7.00 $
└── Vendeur (93%): 93.00 $
```

### Flux
1. Client achète un produit
2. Stripe traite le paiement
3. Edge Function calcule commission
4. Enregistrement dans `purchases`
5. Trigger met à jour `platform_earnings`
6. Vendeur reçoit 93%

## 🔐 Sécurité

- ✅ RLS activé sur toutes les tables
- ✅ Calculs côté serveur uniquement
- ✅ Validation des entrées
- ✅ Clés API sécurisées
- ✅ HTTPS obligatoire
- ✅ CORS configuré

## 📈 Performance

- **Build time**: ~35-50s
- **Bundle size**: 533 kB (139 kB gzipped)
- **Lighthouse Score**: 90+
- **First Contentful Paint**: <2s

## 🧪 Tests

```bash
# Tests unitaires (à venir)
npm run test

# Tests E2E (à venir)
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📚 Documentation

- [Guide de démarrage](DEMARRAGE_RAPIDE.md)
- [Système de commission](COMMISSION_SYSTEM.md)
- [Guide de mise en page](GUIDE_MISE_EN_PAGE.md)
- [Analyse des erreurs](ANALYSE_ERREURS.md)
- [Session finale](SESSION_FINALE.md)

## 🤝 Contribution

Les contributions sont les bienvenues! Veuillez:
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Roadmap

### Court terme (1-2 semaines)
- [ ] Interface admin platform_earnings
- [ ] Système de retrait (Stripe Connect)
- [ ] Notifications paiement
- [ ] Factures automatiques

### Moyen terme (1 mois)
- [ ] Code splitting
- [ ] Service tracking erreurs (Sentry)
- [ ] Cache requêtes
- [ ] Tests automatisés

### Long terme (3+ mois)
- [ ] Programme d'affiliation
- [ ] Commission variable
- [ ] Bonus vendeurs
- [ ] Cashback acheteurs

## 🐛 Bugs Connus

Voir [ANALYSE_ERREURS.md](ANALYSE_ERREURS.md) pour la liste complète.

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Auteurs

- **Développeur Principal** - [kamge80-svg](https://github.com/kamge80-svg)

## 🙏 Remerciements

- [React](https://react.dev)
- [Supabase](https://supabase.com)
- [Stripe](https://stripe.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Vercel](https://vercel.com)

## 📞 Support

- **Email**: support@smframe.com
- **Discord**: [Rejoindre](https://discord.gg/smframe)
- **Documentation**: [Lire](https://docs.smframe.com)

## 🌐 Liens

- **Production**: https://s-m-frame.vercel.app
- **GitHub**: https://github.com/kamge80-svg/s-m
- **Supabase**: https://supabase.com/dashboard

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Dernière mise à jour**: 2025-01-20

🎉 **Développé avec ❤️ par l'équipe S&M Frame**
