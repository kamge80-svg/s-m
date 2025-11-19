# 💳 Guide d'Intégration des Paiements

## 🎯 Vue d'ensemble

Ce guide explique comment intégrer les vraies API de paiement dans l'application.

---

## 1️⃣ ORANGE MONEY

### Inscription
1. Va sur https://developer.orange.com
2. Crée un compte développeur
3. Souscris à l'API "Orange Money"
4. Obtiens tes clés :
   - `client_id`
   - `client_secret`
   - `merchant_key`

### Configuration

Ajoute dans `.env` :
```env
VITE_ORANGE_MONEY_CLIENT_ID=ton_client_id
VITE_ORANGE_MONEY_CLIENT_SECRET=ton_client_secret
VITE_ORANGE_MONEY_MERCHANT_KEY=ton_merchant_key
```

### Flux de paiement

```
1. Utilisateur entre son numéro
2. Frontend → Backend : Demande de paiement
3. Backend → Orange API : Initie transaction
4. Orange → Utilisateur : Notification USSD
5. Utilisateur : Confirme avec code PIN
6. Orange → Backend : Callback de confirmation
7. Backend → Frontend : Succès
```

### Code Backend (Supabase Edge Function)

Créer `supabase/functions/orange-money-payment/index.ts` :

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { phoneNumber, amount, orderId } = await req.json()

  // 1. Obtenir le token d'accès
  const tokenResponse = await fetch('https://api.orange.com/oauth/v3/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(CLIENT_ID + ':' + CLIENT_SECRET)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })
  
  const { access_token } = await tokenResponse.json()

  // 2. Initier le paiement
  const paymentResponse = await fetch('https://api.orange.com/orange-money-webpay/dev/v1/webpayment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      merchant_key: MERCHANT_KEY,
      currency: 'XAF', // ou XOF selon le pays
      order_id: orderId,
      amount: amount,
      return_url: 'https://ton-app.com/payment/success',
      cancel_url: 'https://ton-app.com/payment/cancel',
      notif_url: 'https://ton-app.com/api/payment/callback',
      lang: 'fr',
      reference: `ORDER-${orderId}`
    })
  })

  const result = await paymentResponse.json()
  
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## 2️⃣ MTN MOBILE MONEY

### Inscription
1. Va sur https://momodeveloper.mtn.com
2. Crée un compte
3. Souscris à "Collections" (pour recevoir des paiements)
4. Obtiens :
   - `Ocp-Apim-Subscription-Key`
   - `API User`
   - `API Key`

### Configuration

Ajoute dans `.env` :
```env
VITE_MTN_SUBSCRIPTION_KEY=ta_subscription_key
VITE_MTN_API_USER=ton_api_user
VITE_MTN_API_KEY=ton_api_key
```

### Code Backend (Supabase Edge Function)

Créer `supabase/functions/mtn-money-payment/index.ts` :

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { phoneNumber, amount, orderId } = await req.json()

  // 1. Créer un token d'accès
  const tokenResponse = await fetch('https://sandbox.momodeveloper.mtn.com/collection/token/', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(API_USER + ':' + API_KEY)}`,
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
    }
  })
  
  const { access_token } = await tokenResponse.json()

  // 2. Générer un UUID pour la transaction
  const transactionId = crypto.randomUUID()

  // 3. Demander le paiement
  const paymentResponse = await fetch('https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'X-Reference-Id': transactionId,
      'X-Target-Environment': 'mtnrwanda', // ou mtncameroon, etc.
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: amount.toString(),
      currency: 'XAF',
      externalId: orderId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phoneNumber
      },
      payerMessage: 'Paiement produit',
      payeeNote: `Commande ${orderId}`
    })
  })

  // 4. Vérifier le statut
  const statusResponse = await fetch(`https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/${transactionId}`, {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'X-Target-Environment': 'mtnrwanda',
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
    }
  })

  const status = await statusResponse.json()
  
  return new Response(JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

---

## 3️⃣ STRIPE (Cartes Bancaires)

### Inscription
1. Va sur https://stripe.com
2. Crée un compte
3. Active ton compte (vérification d'identité)
4. Obtiens les clés dans Dashboard > Developers > API keys

### Configuration

Ajoute dans `.env` :
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### Installation

```bash
npm install @stripe/stripe-js
```

### Code Frontend

Modifier `src/components/PaymentModal.tsx` :

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const handleCardPayment = async () => {
  const stripe = await stripePromise;
  
  // 1. Créer une session de paiement
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amount * 100 }) // en centimes
  });
  
  const { clientSecret } = await response.json();
  
  // 2. Confirmer le paiement
  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: {
        number: cardNumber,
        exp_month: parseInt(cardExpiry.split('/')[0]),
        exp_year: parseInt('20' + cardExpiry.split('/')[1]),
        cvc: cardCVV
      }
    }
  });
  
  if (result.error) {
    showToast(result.error.message, 'error');
  } else {
    onPaymentSuccess();
  }
};
```

### Code Backend (Supabase Edge Function)

Créer `supabase/functions/stripe-payment/index.ts` :

```typescript
import Stripe from 'https://esm.sh/stripe@13.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16'
})

serve(async (req) => {
  const { amount, productId } = await req.json()

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // en centimes
    currency: 'usd',
    metadata: {
      productId: productId
    }
  })

  return new Response(
    JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

---

## 4️⃣ DÉPLOIEMENT DES EDGE FUNCTIONS

### Installation Supabase CLI

```bash
npm install -g supabase
```

### Connexion

```bash
supabase login
supabase link --project-ref ton-project-ref
```

### Déployer les fonctions

```bash
supabase functions deploy orange-money-payment
supabase functions deploy mtn-money-payment
supabase functions deploy stripe-payment
```

### Définir les secrets

```bash
supabase secrets set ORANGE_MONEY_CLIENT_ID=xxx
supabase secrets set ORANGE_MONEY_CLIENT_SECRET=xxx
supabase secrets set MTN_SUBSCRIPTION_KEY=xxx
supabase secrets set STRIPE_SECRET_KEY=xxx
```

---

## 5️⃣ MISE À JOUR DU FRONTEND

Modifier `src/components/PaymentModal.tsx` pour appeler les Edge Functions :

```typescript
const handleMobilePayment = async () => {
  setProcessing(true);
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${mobileProvider}-money-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token}`
        },
        body: JSON.stringify({
          phoneNumber,
          amount,
          orderId: `ORDER-${Date.now()}`
        })
      }
    );
    
    const result = await response.json();
    
    if (result.status === 'SUCCESSFUL') {
      onPaymentSuccess();
    } else {
      showToast('Paiement échoué', 'error');
    }
  } catch (error) {
    showToast('Erreur de paiement', 'error');
  } finally {
    setProcessing(false);
  }
};
```

---

## 6️⃣ WEBHOOKS & CALLBACKS

### Créer une table pour les transactions

```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'XAF',
  payment_method TEXT, -- 'orange', 'mtn', 'stripe'
  transaction_id TEXT UNIQUE,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Créer un endpoint de callback

```typescript
// supabase/functions/payment-callback/index.ts
serve(async (req) => {
  const payload = await req.json()
  
  // Vérifier la signature (sécurité)
  // Mettre à jour le statut de la transaction
  // Débloquer le contenu si succès
  
  await supabase
    .from('payment_transactions')
    .update({ status: 'completed' })
    .eq('transaction_id', payload.transaction_id)
  
  return new Response('OK', { status: 200 })
})
```

---

## 7️⃣ TESTS

### Mode Sandbox

Tous les providers ont un mode sandbox/test :

- **Orange Money** : https://api.orange.com/sandbox
- **MTN MoMo** : https://sandbox.momodeveloper.mtn.com
- **Stripe** : Utilise les clés de test (pk_test_...)

### Numéros de test

- Orange Money : Fournis dans la documentation
- MTN MoMo : 46733123450 (sandbox)
- Stripe : 4242 4242 4242 4242

---

## 📊 RÉSUMÉ DES COÛTS

| Provider | Frais de transaction | Setup |
|----------|---------------------|-------|
| Orange Money | ~2-3% | Gratuit |
| MTN MoMo | ~2-3% | Gratuit |
| Stripe | 2.9% + $0.30 | Gratuit |

---

## ⚠️ IMPORTANT

1. **Sécurité** : JAMAIS exposer les clés secrètes côté frontend
2. **Validation** : Toujours vérifier les paiements côté backend
3. **Logs** : Enregistrer toutes les transactions
4. **Conformité** : Respecter les réglementations locales (KYC, AML)
5. **Support** : Prévoir un système de remboursement

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ Créer les comptes développeurs
2. ✅ Obtenir les clés API
3. ✅ Créer les Edge Functions
4. ✅ Tester en mode sandbox
5. ✅ Passer en production
6. ✅ Monitorer les transactions

Bonne chance ! 🎉
