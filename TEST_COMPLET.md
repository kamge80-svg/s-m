# 🧪 Test Complet de l'Application

## Vue d'Ensemble

Application de marketplace de produits digitaux de type TikTok/Instagram avec vidéos, images, likes, commentaires, et profils utilisateurs.

---

## 📋 Checklist de Test

### ✅ Authentification

#### Test 1: Inscription
- [ ] Ouvre l'application
- [ ] Clique sur "Don't have an account? Sign up"
- [ ] Entre un username (3-30 caractères, alphanumériques)
- [ ] Entre un email valide
- [ ] Entre un mot de passe (8+ caractères, majuscule, minuscule, chiffre)
- [ ] Clique "Sign Up"
- [ ] **Résultat attendu:** Toast "Account created successfully!" + Redirection vers feed

#### Test 2: Connexion
- [ ] Déconnecte-toi (Profile > Sign Out)
- [ ] Entre ton email
- [ ] Entre ton mot de passe
- [ ] Clique "Sign In"
- [ ] **Résultat attendu:** Toast "Welcome back!" + Redirection vers feed

#### Test 3: Validation des Inputs
- [ ] Essaie username < 3 caractères → Erreur
- [ ] Essaie email invalide → Erreur
- [ ] Essaie mot de passe < 8 caractères → Erreur
- [ ] Essaie mot de passe sans majuscule → Erreur
- [ ] **Résultat attendu:** Messages d'erreur clairs pour chaque cas

---

### ✅ Feed Principal

#### Test 4: Chargement du Feed
- [ ] Le feed charge avec skeleton loaders
- [ ] Les produits s'affichent (4 produits actuellement)
- [ ] Chaque produit affiche: image/vidéo, titre, description, prix, username
- [ ] **Résultat attendu:** Feed fluide, pas d'erreur console

#### Test 5: Scroll Vertical
- [ ] Scroll vers le bas
- [ ] Les produits changent avec snap scroll
- [ ] La navigation bottom reste visible
- [ ] **Résultat attendu:** Scroll fluide, snap sur chaque produit

#### Test 6: Vidéos Auto-play
- [ ] Scroll sur une vidéo
- [ ] La vidéo se lit automatiquement (ou bouton play sur mobile)
- [ ] Scroll ailleurs
- [ ] La vidéo se met en pause
- [ ] Reviens sur la vidéo
- [ ] La vidéo redémarre depuis le début
- [ ] **Résultat attendu:** Lecture automatique fluide

#### Test 7: Contrôle du Son
- [ ] Clique sur le bouton volume (VolumeX)
- [ ] Le son s'active
- [ ] L'icône change en Volume2
- [ ] Clique à nouveau
- [ ] Le son se coupe
- [ ] **Résultat attendu:** Son activable/désactivable

---

### ✅ Interactions Sociales

#### Test 8: Like (Bouton)
- [ ] Clique sur le bouton cœur
- [ ] Le cœur devient rouge
- [ ] Le compteur augmente de 1
- [ ] Toast "Liked" (optionnel)
- [ ] Clique à nouveau
- [ ] Le cœur redevient blanc
- [ ] Le compteur diminue de 1
- [ ] **Résultat attendu:** Like/unlike fonctionne, compteur à jour

#### Test 9: Double-Tap to Like
- [ ] Double-clic rapide sur une vidéo/image
- [ ] Un gros cœur rouge apparaît avec animation
- [ ] Le produit est liké
- [ ] Le compteur augmente
- [ ] Double-tap sur un produit déjà liké
- [ ] Rien ne se passe (pas de unlike)
- [ ] **Résultat attendu:** Animation fluide, like fonctionne

#### Test 10: Commentaires
- [ ] Clique sur le bouton commentaire
- [ ] Modal de commentaires s'ouvre
- [ ] Les commentaires existants s'affichent
- [ ] Tape un commentaire
- [ ] Clique "Send"
- [ ] Le commentaire apparaît en haut
- [ ] Le compteur augmente
- [ ] Ferme le modal
- [ ] **Résultat attendu:** Commentaires fonctionnels, temps relatif affiché

#### Test 11: Partage
- [ ] Clique sur le bouton partage
- [ ] Sur mobile: Menu de partage natif s'ouvre
- [ ] Sur desktop: Toast "Link copied to clipboard!"
- [ ] Colle le lien → URL correcte
- [ ] **Résultat attendu:** Partage fonctionne

#### Test 12: Bookmark
- [ ] Clique sur le bouton bookmark
- [ ] L'icône devient bleue et remplie
- [ ] Toast "Added to bookmarks"
- [ ] Va dans Bookmarks (navigation bottom)
- [ ] Le produit apparaît dans la liste
- [ ] Clique pour retirer
- [ ] Le produit disparaît
- [ ] **Résultat attendu:** Bookmarks sauvegardés

---

### ✅ Création de Produit

#### Test 13: Upload Image
- [ ] Clique sur le bouton "+" (Create)
- [ ] Clique sur "Upload Image or Video"
- [ ] Sélectionne une image (JPG, PNG, GIF, WebP)
- [ ] L'image s'affiche en preview
- [ ] Entre un titre
- [ ] Entre une description (optionnel)
- [ ] Entre un prix (optionnel)
- [ ] Entre une catégorie (optionnel)
- [ ] Entre des tags séparés par virgules (optionnel)
- [ ] Clique "Publish"
- [ ] **Résultat attendu:** Toast "Product published successfully!" + Retour au feed avec nouveau produit

#### Test 14: Upload Vidéo
- [ ] Même processus avec une vidéo (MP4, MOV, AVI, WebM)
- [ ] La vidéo s'affiche en preview avec contrôles
- [ ] Publie
- [ ] **Résultat attendu:** Vidéo uploadée et visible dans le feed

#### Test 15: Validation Upload
- [ ] Essaie d'uploader un fichier > 10MB (image) → Erreur
- [ ] Essaie d'uploader un fichier > 100MB (vidéo) → Erreur
- [ ] Essaie d'uploader un PDF → Erreur
- [ ] Essaie de publier sans titre → Bouton désactivé
- [ ] Essaie de publier sans média → Bouton désactivé
- [ ] **Résultat attendu:** Validations fonctionnent, messages clairs

#### Test 16: Annulation
- [ ] Commence à créer un produit
- [ ] Clique "Cancel"
- [ ] Retour au feed
- [ ] Rien n'est publié
- [ ] **Résultat attendu:** Annulation propre

---

### ✅ Gestion des Produits

#### Test 17: Édition de Produit
- [ ] Va sur un de tes produits
- [ ] Clique sur le bouton "..." (3 points)
- [ ] Clique "Edit Product"
- [ ] Modifie le titre
- [ ] Modifie la description
- [ ] Modifie le prix
- [ ] Clique "Save"
- [ ] Toast "Product updated successfully!"
- [ ] Les modifications sont visibles
- [ ] **Résultat attendu:** Édition fonctionne

#### Test 18: Suppression de Produit
- [ ] Clique sur "..." sur ton produit
- [ ] Clique "Delete Product"
- [ ] Dialog de confirmation apparaît
- [ ] Clique "Cancel" → Rien ne se passe
- [ ] Clique à nouveau "Delete Product"
- [ ] Clique "Delete"
- [ ] Toast "Product deleted successfully!"
- [ ] Le produit disparaît du feed
- [ ] **Résultat attendu:** Suppression avec confirmation

#### Test 19: Options Produit (Autres Utilisateurs)
- [ ] Va sur un produit d'un autre utilisateur
- [ ] Le bouton "..." n'apparaît PAS
- [ ] **Résultat attendu:** Seuls tes produits ont le bouton options

---

### ✅ Profil Utilisateur

#### Test 20: Mon Profil
- [ ] Clique sur l'icône profil (navigation bottom)
- [ ] Ton profil s'affiche avec:
  - Avatar (ou placeholder)
  - Username
  - Bio (si remplie)
  - Stats: Products, Followers, Following, Likes
  - Grille de tes produits
- [ ] **Résultat attendu:** Profil complet affiché

#### Test 21: Édition de Profil
- [ ] Clique sur l'icône Settings (engrenage)
- [ ] Modifie ton nom complet
- [ ] Modifie ta bio
- [ ] Upload un avatar (optionnel)
- [ ] Clique "Save"
- [ ] Les modifications sont visibles
- [ ] **Résultat attendu:** Profil mis à jour

#### Test 22: Profil d'un Autre Utilisateur
- [ ] Clique sur le username d'un produit
- [ ] Le profil de l'utilisateur s'ouvre
- [ ] Tu vois ses stats et produits
- [ ] Bouton "Follow" visible
- [ ] Clique "Follow"
- [ ] Le bouton devient "Following"
- [ ] Le compteur Followers augmente
- [ ] Clique "Following" pour unfollow
- [ ] **Résultat attendu:** Follow/unfollow fonctionne

#### Test 23: Déconnexion
- [ ] Va dans ton profil
- [ ] Clique "Sign Out"
- [ ] Retour à l'écran de connexion
- [ ] **Résultat attendu:** Déconnexion propre

---

### ✅ Recherche

#### Test 24: Recherche de Produits
- [ ] Clique sur l'icône recherche (navigation bottom)
- [ ] Tape un mot-clé (ex: "comptine")
- [ ] Les résultats s'affichent en temps réel
- [ ] Clique sur un produit
- [ ] Retour au feed sur ce produit
- [ ] **Résultat attendu:** Recherche fonctionnelle

#### Test 25: Recherche d'Utilisateurs
- [ ] Dans la recherche, clique sur l'onglet "Users"
- [ ] Tape un username
- [ ] Les utilisateurs correspondants s'affichent
- [ ] Clique sur un utilisateur
- [ ] Son profil s'ouvre
- [ ] **Résultat attendu:** Recherche utilisateurs fonctionne

#### Test 26: Recherche Vide
- [ ] Tape un mot qui n'existe pas
- [ ] Message "No products found" ou "No users found"
- [ ] **Résultat attendu:** Message clair

---

### ✅ Trending

#### Test 27: Produits Tendance
- [ ] Clique sur l'icône trending (navigation bottom)
- [ ] Liste des produits triés par likes
- [ ] Clique sur "Views" → Tri par vues
- [ ] Clique sur "Comments" → Tri par commentaires
- [ ] Clique sur un produit
- [ ] Retour au feed
- [ ] **Résultat attendu:** Trending fonctionne avec tri

---

### ✅ Bookmarks

#### Test 28: Liste des Bookmarks
- [ ] Clique sur l'icône bookmark (navigation bottom)
- [ ] Liste de tes produits bookmarkés
- [ ] Clique sur un produit
- [ ] Retour au feed sur ce produit
- [ ] Clique sur X pour retirer
- [ ] Le produit disparaît
- [ ] **Résultat attendu:** Bookmarks gérés

---

### ✅ Navigation

#### Test 29: Bottom Navigation
- [ ] Clique sur chaque icône:
  - Home (feed)
  - Search
  - Create (+)
  - Trending
  - Profile
- [ ] Chaque vue s'affiche correctement
- [ ] Retour au feed fonctionne
- [ ] **Résultat attendu:** Navigation fluide

#### Test 30: Retour Arrière
- [ ] Ouvre un profil
- [ ] Clique sur X ou bouton retour
- [ ] Retour au feed
- [ ] Ouvre les commentaires
- [ ] Clique sur X
- [ ] Retour au feed
- [ ] **Résultat attendu:** Navigation cohérente

---

### ✅ Notifications & Feedback

#### Test 31: Toast Notifications
- [ ] Effectue différentes actions
- [ ] Vérifie que les toasts apparaissent:
  - Succès (vert)
  - Erreur (rouge)
  - Info (bleu)
- [ ] Les toasts disparaissent après 4 secondes
- [ ] Clique sur X pour fermer manuellement
- [ ] **Résultat attendu:** Toasts clairs et fonctionnels

#### Test 32: Skeleton Loaders
- [ ] Recharge l'app
- [ ] Observe les skeleton loaders pendant le chargement:
  - Feed
  - Profile
  - Comments
- [ ] **Résultat attendu:** Loaders élégants, pas de flash

#### Test 33: Error Boundary
- [ ] Ouvre la console
- [ ] Force une erreur (si possible)
- [ ] Page d'erreur élégante s'affiche
- [ ] Bouton "Refresh Page" fonctionne
- [ ] **Résultat attendu:** Erreurs gérées gracieusement

---

### ✅ Performance

#### Test 34: Temps de Chargement
- [ ] Recharge l'app
- [ ] Mesure le temps jusqu'au premier produit visible
- [ ] **Résultat attendu:** < 3 secondes

#### Test 35: Scroll Performance
- [ ] Scroll rapidement entre 10+ produits
- [ ] Pas de lag
- [ ] Vidéos se chargent rapidement
- [ ] **Résultat attendu:** 60fps fluide

#### Test 36: Mémoire
- [ ] Ouvre DevTools > Performance
- [ ] Scroll pendant 1 minute
- [ ] Vérifie la mémoire
- [ ] **Résultat attendu:** Pas de memory leak

---

### ✅ Mobile (Téléphone)

#### Test 37: Responsive Design
- [ ] Ouvre sur téléphone
- [ ] Tous les éléments sont visibles
- [ ] Texte lisible
- [ ] Boutons cliquables
- [ ] **Résultat attendu:** UI adaptée au mobile

#### Test 38: Touch Gestures
- [ ] Scroll vertical fonctionne
- [ ] Double-tap to like fonctionne
- [ ] Pinch to zoom désactivé (correct)
- [ ] **Résultat attendu:** Gestures naturels

#### Test 39: Vidéo Mobile
- [ ] Première vidéo → Bouton play visible
- [ ] Tap le bouton → Vidéo démarre
- [ ] Scroll vers vidéo suivante → Auto-play
- [ ] Pas de fullscreen automatique
- [ ] **Résultat attendu:** Vidéos fonctionnent sur mobile

#### Test 40: Orientation
- [ ] Tourne le téléphone en paysage
- [ ] L'app s'adapte
- [ ] Retourne en portrait
- [ ] **Résultat attendu:** Responsive à l'orientation

---

### ✅ Sécurité

#### Test 41: Validation des Inputs
- [ ] Essaie d'injecter du HTML dans les champs
- [ ] Essaie des caractères spéciaux
- [ ] **Résultat attendu:** Inputs sanitizés, pas de XSS

#### Test 42: Permissions
- [ ] Essaie d'éditer le produit d'un autre → Pas de bouton
- [ ] Essaie d'accéder à des données non autorisées
- [ ] **Résultat attendu:** RLS Supabase protège les données

---

### ✅ Edge Cases

#### Test 43: Pas de Produits
- [ ] Nouveau compte sans produits
- [ ] Message "No products yet. Be the first to post!"
- [ ] **Résultat attendu:** Message clair

#### Test 44: Pas de Connexion Internet
- [ ] Désactive le WiFi
- [ ] Essaie de charger le feed
- [ ] Message d'erreur approprié
- [ ] Réactive le WiFi
- [ ] Retry fonctionne
- [ ] **Résultat attendu:** Gestion offline gracieuse

#### Test 45: Upload Échoué
- [ ] Essaie d'uploader un fichier corrompu
- [ ] Message d'erreur clair
- [ ] Possibilité de réessayer
- [ ] **Résultat attendu:** Erreur gérée

---

## 📊 Résultats Attendus

### Fonctionnalités Complètes
- ✅ Authentification (signup, login, logout)
- ✅ Feed avec scroll infini
- ✅ Vidéos auto-play
- ✅ Double-tap to like
- ✅ Likes, commentaires, partage, bookmarks
- ✅ Création de produits (image/vidéo)
- ✅ Édition/suppression de produits
- ✅ Profils utilisateurs
- ✅ Follow/unfollow
- ✅ Recherche (produits et utilisateurs)
- ✅ Trending
- ✅ Toast notifications
- ✅ Skeleton loaders
- ✅ Error boundary
- ✅ Validation des inputs
- ✅ Mobile responsive

### Performance
- Temps de chargement: < 3s
- Scroll: 60fps
- Pas de memory leak
- Vidéos optimisées

### Sécurité
- Inputs sanitizés
- RLS Supabase actif
- Pas de XSS
- Permissions correctes

---

## 🐛 Bugs Connus

Aucun bug critique identifié après les corrections.

---

## 📝 Notes de Test

### Environnement
- Navigateur: Chrome, Firefox, Safari
- Mobile: iOS Safari, Android Chrome
- Résolution: Desktop 1920x1080, Mobile 375x667

### Données de Test
- 4 produits existants
- 1 utilisateur: akimkamte@gmail.com (@produit)

### Prochains Tests
- Tests de charge (100+ produits)
- Tests multi-utilisateurs
- Tests de sécurité approfondis
- Tests d'accessibilité (WCAG)

---

## ✅ Validation Finale

- [ ] Tous les tests passent
- [ ] Pas d'erreur console
- [ ] Performance acceptable
- [ ] Mobile fonctionne
- [ ] Prêt pour déploiement

---

## 🚀 Après les Tests

Si tous les tests passent:
1. Retire le composant SupabaseTest de App.tsx
2. Retire les console.log de debug
3. Build pour production: `npm run build`
4. Déploie sur Vercel/Netlify
5. Teste en production

**Bonne chance avec les tests !** 🎉
