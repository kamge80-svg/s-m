# Test Rapide - Nouvelles Fonctionnalités

## 🚀 Étape 1 : Appliquer la Migration Supabase

**IMPORTANT : À faire en premier !**

1. Allez sur https://supabase.com/dashboard
2. Ouvrez votre projet
3. Cliquez sur **SQL Editor** (menu gauche)
4. Cliquez **New Query**
5. Ouvrez le fichier `supabase/migrations/add_advanced_products.sql` sur votre ordinateur
6. Copiez TOUT le contenu
7. Collez dans l'éditeur Supabase
8. Cliquez **Run** (ou F5)
9. Vérifiez qu'il affiche "Success" en vert

---

## 📱 Étape 2 : Attendre le Déploiement

Le code a été poussé sur GitHub. Vercel va redéployer automatiquement.

1. Allez sur https://vercel.com/dashboard
2. Cliquez sur votre projet "s-m"
3. Attendez que le statut soit **"Ready"** (vert) - environ 2-3 minutes

---

## 🎯 Étape 3 : Tester les Codes Promo

### Accès temporaire via console :

1. Ouvrez votre app : `https://s-m-frame.vercel.app`
2. Connectez-vous
3. Appuyez sur **F12** (ouvre la console développeur)
4. Dans la console, tapez :
```javascript
window.location.href = '/#promos'
```
5. Appuyez sur **Entrée**

### Créer un code promo :

1. Cliquez **"New Code"**
2. Cliquez **"Generate"** pour générer un code automatique
3. Laissez "Percentage" sélectionné
4. Entrez **20** dans "Discount Value" (= 20% de réduction)
5. Cliquez **"Create Code"**

### Tester :

- ✅ Le code apparaît dans la liste
- ✅ Cliquez sur l'icône "copier" → Le code est copié
- ✅ Cliquez sur "Active" → Passe à "Inactive"
- ✅ Cliquez sur la poubelle → Supprime le code

---

## 📦 Étape 4 : Tester les Bundles

### Prérequis : Avoir au moins 2 produits

Si vous n'avez pas encore de produits :
1. Cliquez sur le **+** en bas
2. Créez 2-3 produits avec des prix différents

### Créer un bundle :

1. Dans la console (F12), tapez :
```javascript
// Créer une variable globale pour ouvrir le modal
window.testBundle = true;
```

2. Ou ajoutez temporairement dans votre profil un bouton "Create Bundle"

### Test du bundle :

1. Donnez un titre : "Pack Complet"
2. Sélectionnez 2 ou 3 produits
3. Ajustez le slider de réduction (ex: 25%)
4. Vérifiez que le prix se calcule automatiquement
5. Vérifiez l'économie affichée
6. Cliquez "Create Bundle"

---

## 🔍 Vérification dans Supabase

1. Retournez sur https://supabase.com/dashboard
2. Cliquez **Table Editor** (menu gauche)
3. Vérifiez ces tables :

### Table `promo_codes`
- Doit contenir vos codes promo
- Vérifiez les colonnes : code, discount_value, active

### Table `bundles`
- Doit contenir vos bundles
- Vérifiez : title, price, discount_percentage

### Table `bundle_items`
- Doit lier les bundles aux produits
- Vérifiez : bundle_id, product_id

---

## ✅ Checklist de Test

### Codes Promo :
- [ ] Créer un code promo
- [ ] Générer un code automatique
- [ ] Copier un code
- [ ] Activer/Désactiver un code
- [ ] Supprimer un code
- [ ] Voir la liste des codes

### Bundles :
- [ ] Créer un bundle avec 2+ produits
- [ ] Voir le calcul automatique du prix
- [ ] Voir l'économie réalisée
- [ ] Sélectionner/Désélectionner des produits
- [ ] Ajuster le pourcentage de réduction

### Base de Données :
- [ ] Migration appliquée sans erreur
- [ ] Tables créées (bundles, promo_codes, etc.)
- [ ] Données enregistrées correctement

---

## 🐛 Problèmes Courants

### "Table does not exist"
→ La migration n'a pas été appliquée. Retournez à l'Étape 1.

### "Permission denied"
→ Les RLS policies ne sont pas créées. Réexécutez toute la migration.

### Page blanche
→ Videz le cache : Ctrl + Shift + Delete → Tout effacer

### Boutons non visibles
→ Utilisez la console (F12) pour naviguer temporairement

---

## 📊 Résultats Attendus

Après ces tests, vous devriez avoir :

✅ **Système de codes promo fonctionnel**
- Créer, modifier, supprimer des codes
- Codes avec pourcentage ou montant fixe
- Limites d'utilisation et dates d'expiration

✅ **Système de bundles fonctionnel**
- Grouper plusieurs produits
- Réduction automatique
- Calcul du prix et économies

✅ **Base de données configurée**
- 4 nouvelles tables
- Politiques de sécurité (RLS)
- Fonctions SQL pour validation

---

## 🎉 Prochaines Étapes

Une fois validé, nous ajouterons :

1. **Affichage des bundles dans le feed**
2. **Application des codes promo au paiement**
3. **Promotions temporaires avec countdown**
4. **Gestion des stocks**
5. **Phase 2 : Système de formations**

---

## 💬 Besoin d'Aide ?

Si quelque chose ne fonctionne pas :
1. Vérifiez la console (F12) pour les erreurs
2. Vérifiez que la migration Supabase est bien appliquée
3. Vérifiez que le déploiement Vercel est terminé
4. Essayez en navigation privée

**Dites-moi ce qui fonctionne et ce qui ne fonctionne pas !**
