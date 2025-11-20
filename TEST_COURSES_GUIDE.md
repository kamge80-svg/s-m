# 🧪 Guide de Test - Système de Formations

## 🎯 Objectif
Tester toutes les fonctionnalités du système de formations après réactivation.

---

## ✅ Prérequis

1. Migration SQL appliquée dans Supabase
2. Application déployée ou en local
3. Au moins 2 comptes utilisateurs (créateur + étudiant)

---

## 📝 Test 1 : Créer une Formation

### En tant que Créateur :

1. **Accéder à la création** :
   ```
   Profile → Seller Tools → Create Course
   ```

2. **Remplir le formulaire** :
   - Titre : "Introduction à React"
   - Description : "Apprenez React de zéro"
   - Prix : 29.99
   - Niveau : Beginner
   - Durée : 10 heures
   - Thumbnail : Uploader une image

3. **Créer des modules** :
   - Module 1 : "Les Bases"
   - Module 2 : "Composants"
   - Module 3 : "Hooks"

4. **Ajouter des leçons** :
   - Leçon 1.1 : "Qu'est-ce que React ?" (gratuite)
   - Leçon 1.2 : "Installation"
   - Leçon 1.3 : "Premier composant"

5. **Ajouter du contenu** :
   - URL vidéo YouTube
   - Contenu texte
   - Durée en minutes

6. **Publier** :
   - Cocher "Published"
   - Sauvegarder

### ✅ Résultat Attendu :
- Formation visible dans le feed
- Modules et leçons créés
- Leçon gratuite accessible sans inscription

---

## 📝 Test 2 : S'inscrire à une Formation

### En tant qu'Étudiant :

1. **Trouver la formation** :
   - Chercher "React" dans la recherche
   - Ou voir dans le feed

2. **Voir les détails** :
   - Cliquer sur la formation
   - Voir les modules
   - Prévisualiser la leçon gratuite

3. **S'inscrire** :
   - Cliquer "Enroll"
   - Payer (si payante)
   - Confirmer l'inscription

### ✅ Résultat Attendu :
- Inscription confirmée
- Accès à toutes les leçons
- Progression à 0%

---

## 📝 Test 3 : Suivre une Leçon

### En tant qu'Étudiant Inscrit :

1. **Ouvrir une leçon** :
   - Cliquer sur Module 1
   - Cliquer sur Leçon 1.1

2. **Regarder la vidéo** :
   - Player vidéo fonctionne
   - Contrôles disponibles
   - Temps enregistré

3. **Marquer comme complétée** :
   - Cliquer "Mark as Complete"
   - Vérifier la progression

### ✅ Résultat Attendu :
- Vidéo joue correctement
- Leçon marquée complétée
- Progression mise à jour (ex: 33%)

---

## 📝 Test 4 : Passer un Quiz

### En tant qu'Étudiant :

1. **Créer un quiz** (en tant que créateur) :
   ```javascript
   Question 1: "Qu'est-ce que JSX ?"
   Options:
   - Une extension JavaScript
   - Un framework
   - Une bibliothèque
   - Un langage
   Réponse: 0 (Une extension JavaScript)
   ```

2. **Passer le quiz** (en tant qu'étudiant) :
   - Répondre aux questions
   - Soumettre
   - Voir le score

3. **Vérifier le résultat** :
   - Score affiché
   - Explications visibles
   - Possibilité de refaire

### ✅ Résultat Attendu :
- Quiz fonctionne
- Score calculé correctement
- Feedback immédiat

---

## 📝 Test 5 : Obtenir un Certificat

### En tant qu'Étudiant :

1. **Compléter toutes les leçons** :
   - Marquer chaque leçon comme complétée
   - Progression atteint 100%

2. **Vérifier le certificat** :
   - Aller dans Profile → My Certificates
   - Voir le certificat généré
   - Télécharger le PDF

### ✅ Résultat Attendu :
- Certificat généré automatiquement
- Nom de l'étudiant
- Nom de la formation
- Date d'obtention
- Téléchargeable en PDF

---

## 📝 Test 6 : Forum de Discussion

### En tant qu'Étudiant Inscrit :

1. **Créer une discussion** :
   - Aller dans l'onglet "Discussions"
   - Cliquer "New Discussion"
   - Titre : "Question sur les Hooks"
   - Contenu : "Comment utiliser useState ?"

2. **Répondre à une discussion** :
   - Ouvrir une discussion
   - Écrire une réponse
   - Soumettre

### ✅ Résultat Attendu :
- Discussion créée
- Visible par tous les inscrits
- Réponses fonctionnent
- Notifications envoyées

---

## 📝 Test 7 : Statistiques Créateur

### En tant que Créateur :

1. **Voir les statistiques** :
   - Profile → Analytics
   - Voir les formations

2. **Vérifier les données** :
   - Nombre d'inscrits
   - Taux de complétion
   - Revenus générés
   - Leçons populaires

### ✅ Résultat Attendu :
- Statistiques précises
- Graphiques clairs
- Données en temps réel

---

## 📝 Test 8 : Progression Multi-Appareils

### Test de Synchronisation :

1. **Sur Desktop** :
   - Compléter Leçon 1
   - Progression : 33%

2. **Sur Mobile** :
   - Se connecter
   - Vérifier la progression
   - Compléter Leçon 2

3. **Retour sur Desktop** :
   - Rafraîchir
   - Vérifier progression : 66%

### ✅ Résultat Attendu :
- Progression synchronisée
- Temps réel
- Pas de perte de données

---

## 🐛 Checklist de Bugs Communs

### À Vérifier :

- [ ] Vidéos se chargent correctement
- [ ] Progression sauvegardée
- [ ] Certificats générés
- [ ] Quiz calculent bien les scores
- [ ] Discussions visibles
- [ ] Notifications envoyées
- [ ] RLS fonctionne (pas d'accès non autorisé)
- [ ] Responsive mobile
- [ ] Performance acceptable

---

## 🔍 Tests de Sécurité

### Test RLS (Row Level Security) :

1. **Sans inscription** :
   - ❌ Ne peut pas voir les leçons payantes
   - ✅ Peut voir les leçons gratuites
   - ❌ Ne peut pas marquer comme complété

2. **Avec inscription** :
   - ✅ Peut voir toutes les leçons
   - ✅ Peut marquer comme complété
   - ✅ Peut participer aux discussions

3. **En tant que créateur** :
   - ✅ Peut modifier sa formation
   - ❌ Ne peut pas modifier les formations des autres
   - ✅ Peut voir les statistiques

---

## 📊 Métriques de Performance

### À Mesurer :

1. **Temps de chargement** :
   - Page formation : < 2s
   - Player vidéo : < 1s
   - Liste des leçons : < 1s

2. **Taille des bundles** :
   - JS principal : < 500KB
   - CSS : < 100KB
   - Images optimisées

3. **Requêtes Supabase** :
   - Utiliser le cache
   - Limiter les appels
   - Pagination efficace

---

## ✅ Validation Finale

### Checklist Complète :

- [ ] Création de formation fonctionne
- [ ] Inscription fonctionne
- [ ] Leçons accessibles
- [ ] Vidéos jouent
- [ ] Quiz fonctionnent
- [ ] Progression sauvegardée
- [ ] Certificats générés
- [ ] Discussions actives
- [ ] Statistiques précises
- [ ] Sécurité RLS OK
- [ ] Performance acceptable
- [ ] Mobile responsive

---

## 🚀 Prêt pour la Production !

Si tous les tests passent :
1. ✅ Système stable
2. ✅ Fonctionnalités complètes
3. ✅ Sécurité validée
4. ✅ Performance OK

**Vous pouvez déployer en production !** 🎉

---

## 📞 Support

En cas de problème :
1. Vérifier les logs Supabase
2. Vérifier la console navigateur
3. Tester les requêtes SQL manuellement
4. Vérifier les politiques RLS

**Bon test !** 🧪
