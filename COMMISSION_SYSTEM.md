# 💰 SYSTÈME DE COMMISSION - 7% Plateforme / 93% Vendeur

## 📊 RÉPARTITION DES REVENUS

### Pour chaque vente:
```
Prix du produit: 100.00 $
├── Commission plateforme (7%): 7.00 $
└── Montant vendeur (93%): 93.00 $
```

---

## 🔧 IMPLÉMENTATION

### 1. **Edge Function Stripe** ✅
**Fichier**: `supabase/functions/create-payment-intent/index.ts`

```typescript
// Calcul automatique lors de la création du payment intent
const platformFee = Math.round(totalAmount * 0.07); // 7%
const sellerAmount = totalAmount - platformFee;     // 93%
```

**Métadonnées Stripe**:
- `platformFee`: Montant de la commission
- `sellerAmount`: Montant pour le vendeur
- `sellerId`: ID du vendeur

---

### 2. **Table Purchases** ✅
**Migration**: `supabase/migrations/add_platform_commission.sql`

**Nouvelles colonnes**:
```sql
- platform_fee DECIMAL(10, 2)      -- Commission plateforme (7%)
- seller_amount DECIMAL(10, 2)     -- Montant vendeur (93%)
- commission_rate DECIMAL(5, 2)    -- Taux de commission (7.00%)
```

---

### 3. **Table Platform Earnings** ✅
**Nouvelle table** pour tracker les revenus de la plateforme:

```sql
CREATE TABLE platform_earnings (
  id UUID PRIMARY KEY,
  date DATE UNIQUE,
  total_sales DECIMAL(10, 2),        -- Total des ventes
  total_commission DECIMAL(10, 2),   -- Total des commissions
  transaction_count INTEGER,          -- Nombre de transactions
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Trigger automatique**: Met à jour les earnings quotidiens à chaque achat

---

### 4. **Service Stripe** ✅
**Fichier**: `src/services/stripeService.ts`

**Fonction `createPaymentIntent`**:
```typescript
createPaymentIntent(productId, amount, sellerId)
// Envoie le sellerId pour tracking
```

**Fonction `confirmPurchase`**:
```typescript
confirmPurchase(productId, paymentIntentId, amount, sellerId)
// Enregistre: amount, platform_fee, seller_amount
```

---

## 📈 EXEMPLES DE CALCUL

### Exemple 1: Produit à 50$
```
Prix: 50.00 $
Commission (7%): 3.50 $
Vendeur (93%): 46.50 $
```

### Exemple 2: Produit à 199.99$
```
Prix: 199.99 $
Commission (7%): 14.00 $
Vendeur (93%): 185.99 $
```

### Exemple 3: Produit à 9.99$
```
Prix: 9.99 $
Commission (7%): 0.70 $
Vendeur (93%): 9.29 $
```

---

## 🔍 TRACKING & ANALYTICS

### Pour les vendeurs:
- **Revenue affiché**: Montant après commission (93%)
- **Wallet**: Affiche le montant disponible pour retrait
- **Analytics**: Détail des ventes avec commission déduite

### Pour la plateforme:
- **Table `platform_earnings`**: Revenus quotidiens
- **Métriques**:
  - Total des ventes
  - Total des commissions
  - Nombre de transactions
  - Moyenne par transaction

---

## 🔐 SÉCURITÉ

### ✅ Calculs côté serveur
- Commission calculée dans Edge Function (Supabase)
- Impossible de manipuler depuis le client
- Validation des montants

### ✅ Traçabilité
- Chaque transaction enregistrée avec détails
- Payment Intent ID Stripe
- Métadonnées complètes

### ✅ RLS (Row Level Security)
- `platform_earnings`: Accessible uniquement aux admins
- `purchases`: Utilisateurs voient leurs propres achats
- Vendeurs voient leurs ventes

---

## 📝 PROCHAINES ÉTAPES

### Phase 1: ✅ COMPLÉTÉ
- [x] Calcul automatique 7%/93%
- [x] Enregistrement dans purchases
- [x] Table platform_earnings
- [x] Trigger automatique

### Phase 2: À FAIRE
- [ ] Interface admin pour voir platform_earnings
- [ ] Système de retrait pour vendeurs (Stripe Connect)
- [ ] Notifications de paiement
- [ ] Factures automatiques
- [ ] Rapports mensuels

### Phase 3: Avancé
- [ ] Commission variable par catégorie
- [ ] Bonus pour top vendeurs
- [ ] Programme d'affiliation
- [ ] Cashback pour acheteurs

---

## 🧪 TESTS

### Test 1: Achat simple
```
1. Créer un produit à 100$
2. Effectuer un achat
3. Vérifier dans purchases:
   - amount: 100.00
   - platform_fee: 7.00
   - seller_amount: 93.00
```

### Test 2: Platform earnings
```
1. Effectuer plusieurs achats
2. Vérifier platform_earnings pour aujourd'hui:
   - total_sales: Somme des achats
   - total_commission: Somme des 7%
   - transaction_count: Nombre d'achats
```

---

## 💡 NOTES IMPORTANTES

### Arrondis
- Tous les montants arrondis à 2 décimales
- Calcul: `Math.round(amount * 0.07 * 100) / 100`

### Stripe
- Montants en centimes (multiply by 100)
- Commission incluse dans le total
- Pas de frais supplémentaires pour l'acheteur

### Base de données
- Type DECIMAL(10, 2) pour précision
- Indexes sur platform_fee et seller_amount
- Trigger automatique pour platform_earnings

---

**Date d'implémentation**: 2025-01-20
**Status**: ✅ ACTIF
**Taux de commission**: 7% (modifiable dans la migration)
