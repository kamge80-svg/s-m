# Configuration Rapide Stripe

## Étape 1 : Ajouter votre clé publique Stripe

Ouvrez `.env` et remplacez :
```env
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
```

Par votre vraie clé (commence par `pk_test_` ou `pk_live_`) :
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC...
```

## Étape 2 : Créer la table purchases dans Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Cliquez sur **New Query**
5. Copiez-collez le contenu du fichier `supabase/migrations/add_purchases_table.sql`
6. Cliquez sur **Run** (ou F5)

## Étape 3 : Configurer la fonction Edge

### Via Dashboard (Recommandé)

1. Dans Supabase Dashboard, allez dans **Edge Functions**
2. Cliquez sur **Secrets** (onglet en haut)
3. Ajoutez un nouveau secret :
   - **Name** : `STRIPE_SECRET_KEY`
   - **Value** : Votre clé secrète Stripe (commence par `sk_test_`)
4. Cliquez sur **Save**

5. Ensuite, allez dans l'onglet **Functions**
6. Cliquez sur **Deploy a new function**
7. Uploadez le dossier `supabase/functions/create-payment-intent`

### Via CLI (Alternative)

Si vous avez Supabase CLI installé :

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter
supabase login

# Lier votre projet (remplacez par votre project-ref)
supabase link --project-ref yqsxevpqeapjwsdcryxy

# Définir le secret
supabase secrets set STRIPE_SECRET_KEY=sk_test_votre_cle_secrete

# Déployer la fonction
supabase functions deploy create-payment-intent
```

## Étape 4 : Tester

1. Redémarrez votre application : `npm run dev`
2. Allez sur un produit
3. Cliquez sur "Acheter"
4. Sélectionnez "Carte Bancaire"
5. Utilisez une carte de test Stripe :
   - **Numéro** : `4242 4242 4242 4242`
   - **Date** : `12/25`
   - **CVV** : `123`

## Obtenir vos clés Stripe

1. Allez sur https://dashboard.stripe.com/
2. Créez un compte (gratuit)
3. Allez dans **Developers** > **API keys**
4. Copiez :
   - **Publishable key** (pk_test_...) → pour `.env`
   - **Secret key** (sk_test_...) → pour Supabase secrets

## Vérification

✅ `.env` contient `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
✅ Table `purchases` créée dans Supabase
✅ Secret `STRIPE_SECRET_KEY` ajouté dans Supabase
✅ Fonction Edge déployée

C'est tout ! Votre intégration Stripe est prête.
