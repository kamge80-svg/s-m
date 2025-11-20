# Guide de Test - Phase 1 : Bundles & Promo Codes

## Préparation

### 1. Appliquer la migration Supabase

Dans le dashboard Supabase (https://supabase.com/dashboard) :

1. Allez dans **SQL Editor**
2. Cliquez **New Query**
3. Copiez tout le contenu de `supabase/migrations/add_advanced_products.sql`
4. Collez et cliquez **Run**
5. Vérifiez qu'il n'y a pas d'erreurs

### 2. Déployer les changements

```cmd
git add .
git commit -m "Add bundles and promo codes features"
git push origin main
```

Attendez 2-3 minutes que Vercel redéploie.

---

## Test 1 : Créer un Bundle

### Étapes :

1. **Ouvrez votre application** : `https://s-m-frame.vercel.app`

2. **Créez au moins 2 produits** (si vous n'en avez pas déjà) :
   - Cliquez sur le bouton **+** en bas
   - Uploadez une vidéo ou image
   - Donnez un titre et un prix
   - Publiez

3. **Accédez à la création de bundle** :
   - Pour l'instant, ouvrez la console développeur (F12)
   - Tapez : `window.location.hash = '#create-bundle'`
   - OU ajoutez temporairement un bouton dans votre profil

4. **Créez le bundle** :
   - Donnez un titre (ex: "Pack Complet")
   - Ajoutez une description
   - Sélectionnez au moins 2 produits
   - Ajustez le pourcentage de réduction (10-50%)
   - Vérifiez le calcul du prix
   - Cliquez "Create Bundle"

### Résultat attendu :
✅ Bundle créé avec succès
✅ Prix calculé automatiquement avec réduction
✅ Toast de confirmation affiché

---

## Test 2 : Gérer les Codes Promo

### Étapes :

1. **Accédez au gestionnaire de codes promo** :
   - Ouvrez la console (F12)
   - Tapez : `window.location.hash = '#promo-codes'`

2. **Créez un code promo** :
   - Cliquez **"New Code"**
   - Entrez un code (ex: SUMMER2024) ou cliquez "Generate"
   - Choisissez le type : Percentage ou Fixed
   - Entrez la valeur (ex: 20 pour 20%)
   - Définissez un montant minimum (optionnel)
   - Définissez un nombre max d'utilisations (optionnel)
   - Définissez une date d'expiration (optionnel)
   - Cliquez "Create Code"

3. **Testez les actions** :
   - Copiez le code (bouton copier)
   - Désactivez/Activez le code
   - Supprimez un code

### Résultat attendu :
✅ Code promo créé
✅ Code copié dans le presse-papier
✅ Statut Active/Inactive fonctionne
✅ Suppression fonctionne

---

## Test 3 : Vérifier la Base de Données

### Dans Supabase Dashboard :

1. **Allez dans Table Editor**

2. **Vérifiez les tables créées** :
   - `bundles` - Doit contenir vos bundles
   - `bundle_items` - Doit lier bundles et produits
   - `promo_codes` - Doit contenir vos codes
   - `promotions` - Vide pour l'instant

3. **Vérifiez les données** :
   - Les prix sont corrects
   - Les relations sont bonnes
   - Les timestamps sont présents

---

## Accès Temporaire aux Nouvelles Pages

Pour tester facilement, ajoutez ces boutons temporaires dans votre profil :

### Option A : Via Console (Rapide)

Ouvrez la console (F12) et tapez :

```javascript
// Pour créer un bundle
window.showCreateBundle = true;

// Pour gérer les promos
window.location.hash = '#promo-codes';
```

### Option B : Modifier temporairement App.tsx

Ajoutez dans le composant Profile un bouton :

```tsx
<button onClick={() => setShowCreateBundle(true)}>
  Create Bundle
</button>

<button onClick={() => setActiveView('promos')}>
  Manage Promo Codes
</button>
```

---

## Problèmes Courants

### Erreur : "Table does not exist"
**Solution :** La migration n'a pas été appliquée. Retournez dans Supabase SQL Editor et exécutez la migration.

### Erreur : "Permission denied"
**Solution :** Les RLS policies ne sont pas appliquées. Vérifiez que toute la migration a été exécutée.

### Les produits ne s'affichent pas
**Solution :** Assurez-vous d'avoir créé au moins 2 produits avant de créer un bundle.

### Le code promo ne se copie pas
**Solution :** Vérifiez que votre navigateur autorise l'accès au presse-papier.

---

## Prochaines Étapes

Une fois ces tests validés, nous pourrons :

1. ✅ Afficher les bundles dans le feed
2. ✅ Appliquer les codes promo au checkout
3. ✅ Créer des promotions temporaires avec countdown
4. ✅ Ajouter la gestion des stocks
5. ✅ Passer à la Phase 2 (Formations)

---

## Retour d'Expérience

Après vos tests, notez :
- ✅ Ce qui fonctionne bien
- ❌ Ce qui ne fonctionne pas
- 💡 Suggestions d'amélioration

Cela nous aidera à optimiser avant de passer aux phases suivantes !
