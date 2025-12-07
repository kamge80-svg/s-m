# 🔍 CONFIGURATION SENTRY - Monitoring des Erreurs

## 📦 Installation

```bash
npm install @sentry/react @sentry/tracing
```

## 🔧 Configuration

### 1. Créer compte Sentry
- Aller sur https://sentry.io
- Créer un compte gratuit
- Créer un nouveau projet React
- Copier le DSN

### 2. Ajouter au .env
```env
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=production
```

### 3. Initialiser dans main.tsx

```typescript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

// Initialiser Sentry uniquement en production
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production',
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% des transactions
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% des sessions
    replaysOnErrorSampleRate: 1.0, // 100% des erreurs
    
    // Filtrer les erreurs non importantes
    beforeSend(event, hint) {
      // Ignorer les erreurs réseau temporaires
      if (event.exception?.values?.[0]?.value?.includes('NetworkError')) {
        return null;
      }
      return event;
    },
  });
}
```

### 4. Wrapper l'App avec ErrorBoundary

```typescript
import * as Sentry from "@sentry/react";

const SentryRoutes = Sentry.withSentryRouting(Routes);

// Dans le render
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</Sentry.ErrorBoundary>
```

## 📊 Utilisation

### Capturer erreurs manuellement
```typescript
import * as Sentry from "@sentry/react";

try {
  // Code qui peut échouer
} catch (error) {
  Sentry.captureException(error);
  console.error(error);
}
```

### Ajouter contexte
```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});

Sentry.setContext("purchase", {
  productId: product.id,
  amount: amount,
});
```

### Breadcrumbs personnalisés
```typescript
Sentry.addBreadcrumb({
  category: 'payment',
  message: 'User initiated payment',
  level: 'info',
});
```

## 🎯 Métriques à tracker

### Erreurs critiques
- Échecs de paiement
- Erreurs d'authentification
- Échecs d'upload
- Erreurs de base de données

### Performance
- Temps de chargement pages
- Temps de réponse API
- Temps de build

### Comportement utilisateur
- Parcours avant erreur
- Actions répétées
- Navigateur/OS

## 💰 Coûts

### Plan Gratuit
- 5,000 erreurs/mois
- 30 jours de rétention
- 1 utilisateur

### Plan Developer ($26/mois)
- 50,000 erreurs/mois
- 90 jours de rétention
- 1 utilisateur
- Session Replay

### Plan Team ($80/mois)
- 100,000 erreurs/mois
- 90 jours de rétention
- 5 utilisateurs
- Support prioritaire

## 🔔 Alertes

### Configurer dans Sentry Dashboard
1. Alerts → Create Alert Rule
2. Choisir conditions:
   - Erreur spécifique
   - Seuil d'erreurs
   - Nouvelle erreur
3. Configurer notifications:
   - Email
   - Slack
   - Discord
   - Webhook

## 📈 Dashboard recommandé

### Widgets à ajouter
- Taux d'erreur
- Erreurs par page
- Erreurs par utilisateur
- Performance pages
- Navigateurs affectés
- Tendances erreurs

## ✅ Checklist

- [ ] Installer @sentry/react
- [ ] Créer compte Sentry
- [ ] Ajouter DSN au .env
- [ ] Initialiser dans main.tsx
- [ ] Wrapper App avec ErrorBoundary
- [ ] Tester en production
- [ ] Configurer alertes
- [ ] Créer dashboard

## 🧪 Test

```typescript
// Bouton de test (à retirer en prod)
<button onClick={() => {
  throw new Error("Test Sentry Error");
}}>
  Test Sentry
</button>
```

---

**Temps d'implémentation**: 1-2 heures
**Coût**: Gratuit (plan de base)
**Impact**: Critique pour production
