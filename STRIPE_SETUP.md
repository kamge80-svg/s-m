# Configuration Stripe

## 1. Obtenir vos clés API Stripe

1. Allez sur https://dashboard.stripe.com/
2. Créez un compte ou connectez-vous
3. Allez dans **Developers** > **API keys**
4. Copiez :
   - **Publishable key** (commence par `pk_`)
   - **Secret key** (commence par `sk_`)

## 2. Configuration locale (.env)

Ajoutez votre clé publique dans `.env` :

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici
```

⚠️ **Important** : Ne mettez JAMAIS la clé secrète dans le fichier `.env` frontend !

## 3. Configuration Supabase Edge Function

### Déployer la fonction Edge

```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier votre projet
supabase link --project-ref votre-project-ref

# Définir la clé secrète Stripe (IMPORTANT!)
supabase secrets set STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici

# Déployer la fonction
supabase functions deploy create-payment-intent
```

### Alternative : Configuration via Dashboard Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Edge Functions** > **Secrets**
4. Ajoutez : `STRIPE_SECRET_KEY` = `sk_test_votre_cle_secrete`
5. Allez dans **Edge Functions** > **Deploy new function**
6. Uploadez le dossier `supabase/functions/create-payment-intent`

## 4. Tester l'intégration

### Cartes de test Stripe

Utilisez ces numéros de carte pour tester :

- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0027 6000 3184`

Date d'expiration : N'importe quelle date future (ex: 12/25)
CVV : N'importe quel 3 chiffres (ex: 123)

### Test du paiement

1. Lancez votre application : `npm run dev`
2. Allez sur un produit
3. Cliquez sur "Acheter"
4. Sélectionnez "Carte Bancaire"
5. Utilisez une carte de test
6. Vérifiez le paiement dans le Dashboard Stripe

## 5. Passer en production

### Activer votre compte Stripe

1. Complétez les informations de votre entreprise
2. Ajoutez vos informations bancaires
3. Activez votre compte

### Utiliser les clés de production

1. Dans Stripe Dashboard, basculez de "Test mode" à "Live mode"
2. Copiez les nouvelles clés (commencent par `pk_live_` et `sk_live_`)
3. Mettez à jour :
   - `.env` : `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - Supabase secrets : `STRIPE_SECRET_KEY=sk_live_...`

## 6. Webhooks (Optionnel mais recommandé)

Pour recevoir les notifications de paiement :

1. Dans Stripe Dashboard > **Developers** > **Webhooks**
2. Ajoutez un endpoint : `https://votre-projet.supabase.co/functions/v1/stripe-webhook`
3. Sélectionnez les événements :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copiez le **Signing secret**
5. Ajoutez-le dans Supabase : `STRIPE_WEBHOOK_SECRET=whsec_...`

## 7. Sécurité

✅ **À faire** :
- Toujours utiliser HTTPS en production
- Ne jamais exposer la clé secrète
- Valider les montants côté serveur
- Vérifier l'identité de l'utilisateur

❌ **À ne pas faire** :
- Mettre la clé secrète dans le code frontend
- Faire confiance aux montants envoyés par le client
- Ignorer les erreurs de paiement

## Support

- Documentation Stripe : https://stripe.com/docs
- Support Stripe : https://support.stripe.com
- Supabase Edge Functions : https://supabase.com/docs/guides/functions
