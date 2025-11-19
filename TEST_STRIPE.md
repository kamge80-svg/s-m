# Test de l'intégration Stripe

## Comment tester

1. **Lancez l'application** :
   ```bash
   npm run dev
   ```

2. **Connectez-vous** à votre compte

3. **Allez sur un produit** (pas le vôtre)

4. **Cliquez sur "Acheter"**

5. **Sélectionnez "Carte Bancaire"**

6. **Utilisez une carte de test Stripe** :
   - **Numéro** : `4242 4242 4242 4242`
   - **Date d'expiration** : `12/25` (ou n'importe quelle date future)
   - **CVV** : `123` (ou n'importe quel 3 chiffres)

7. **Cliquez sur "Payer"**

## Résultat attendu

✅ Le paiement devrait être traité
✅ Vous devriez voir "Paiement réussi !"
✅ Le contenu du produit devrait se déverrouiller
✅ L'achat devrait être enregistré dans la table `purchases`

## Autres cartes de test

- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure requis** : `4000 0027 6000 3184`
- **Fonds insuffisants** : `4000 0000 0000 9995`

## Vérifier dans Stripe Dashboard

1. Allez sur https://dashboard.stripe.com/test/payments
2. Vous devriez voir vos paiements de test
3. Cliquez sur un paiement pour voir les détails

## Vérifier dans Supabase

1. Allez dans **Table Editor** > **purchases**
2. Vous devriez voir l'enregistrement de l'achat

## En cas de problème

### Erreur "Stripe publishable key not found"
- Vérifiez que `.env` contient `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
- Redémarrez l'application (`npm run dev`)

### Erreur lors de la création du PaymentIntent
- Vérifiez que le secret `STRIPE_SECRET_KEY` est bien configuré dans Supabase
- Vérifiez que la fonction Edge est bien déployée
- Regardez les logs dans Supabase Dashboard > Edge Functions > Logs

### Le paiement ne s'enregistre pas
- Vérifiez que la table `purchases` existe
- Vérifiez les politiques RLS
- Regardez la console du navigateur pour les erreurs

## Support

- Documentation Stripe : https://stripe.com/docs/testing
- Dashboard Stripe : https://dashboard.stripe.com/test/payments
- Supabase Dashboard : https://supabase.com/dashboard
