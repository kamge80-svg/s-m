# 🚀 Guide de Configuration Supabase

Ce guide te montre comment configurer complètement Supabase pour ton application de marketplace digital.

## 📋 Prérequis

- Un compte Supabase (gratuit sur [supabase.com](https://supabase.com))
- Node.js 18+ installé
- Git installé

## Étape 1 : Créer un Projet Supabase

1. Va sur [app.supabase.com](https://app.supabase.com)
2. Clique sur **"New Project"**
3. Remplis les informations :
   - **Name** : `digital-marketplace` (ou ton choix)
   - **Database Password** : Crée un mot de passe fort ⚠️ **GARDE-LE !**
   - **Region** : Choisis la région la plus proche
4. Clique sur **"Create new project"**
5. ⏳ Attends 2-3 minutes que le projet soit créé

## Étape 2 : Récupérer les Clés API

1. Dans ton projet, clique sur l'icône **⚙️ Settings** (en bas à gauche)
2. Clique sur **API** dans le menu
3. Tu verras :
   - **Project URL** : `https://xxx.supabase.co`
   - **anon public key** : Une longue clé commençant par `eyJ...`

4. **Copie ces deux valeurs** (tu en auras besoin à l'étape suivante)

## Étape 3 : Configurer les Variables d'Environnement

Ton fichier `.env` est déjà configuré ! Vérifie qu'il contient :

```env
VITE_SUPABASE_URL=https://qemrktfrbifkbsvppqxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✅ **C'est bon, tu peux passer à l'étape suivante !**

## Étape 4 : Créer la Base de Données

### Option A : Via l'Interface Supabase (Recommandé)

1. Dans ton projet Supabase, clique sur **SQL Editor** (icône 📝 à gauche)
2. Clique sur **"New query"**
3. Ouvre le fichier `supabase/migrations/00_initial_setup.sql` dans ton éditeur
4. **Copie tout le contenu** du fichier
5. **Colle-le** dans l'éditeur SQL de Supabase
6. Clique sur **"Run"** (ou appuie sur Ctrl+Enter)
7. ✅ Tu devrais voir "Success. No rows returned"

### Option B : Via Supabase CLI (Avancé)

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref ton-project-ref

# Appliquer les migrations
supabase db push
```

## Étape 5 : Vérifier l'Installation

### 5.1 Vérifier les Tables

1. Dans Supabase, clique sur **Table Editor** (icône 📊)
2. Tu devrais voir ces tables :
   - ✅ profiles
   - ✅ products
   - ✅ likes
   - ✅ comments
   - ✅ views
   - ✅ bookmarks
   - ✅ purchases

### 5.2 Vérifier le Storage

1. Clique sur **Storage** (icône 📦)
2. Tu devrais voir un bucket nommé **"products"**
3. Il doit être **public** (icône 🌐)

### 5.3 Vérifier l'Authentification

1. Clique sur **Authentication** (icône 👤)
2. Clique sur **Providers**
3. Vérifie que **Email** est activé ✅

## Étape 6 : Tester l'Application

### 6.1 Installer les Dépendances

```bash
npm install
```

### 6.2 Lancer l'Application

```bash
npm run dev
```

### 6.3 Créer un Compte Test

1. Ouvre l'application dans ton navigateur
2. Clique sur **"Sign Up"**
3. Crée un compte avec :
   - Email : `test@example.com`
   - Mot de passe : `Test1234!`
   - Username : `testuser`

4. ✅ Si tu arrives sur le feed, c'est bon !

### 6.4 Utiliser le Composant de Test

L'application inclut un composant de test Supabase. Pour l'activer :

1. Ouvre `src/App.tsx`
2. Décommente la ligne avec `<SupabaseTest />`
3. Recharge l'application
4. Clique sur **"Run Tests"** dans le panneau en haut à droite
5. Tous les tests devraient être ✅ verts

## 🎯 Fonctionnalités Disponibles

Après la configuration, tu peux :

- ✅ Créer un compte et se connecter
- ✅ Créer des produits (images ou vidéos)
- ✅ Uploader une vidéo promo (optionnel)
- ✅ Liker, commenter, partager
- ✅ Voir les profils des utilisateurs
- ✅ Sauvegarder des produits (bookmarks)
- ✅ Gérer son wallet (achats/ventes)

## 🔧 Configuration Avancée

### Activer la Vidéo Promo

La fonctionnalité double vidéo est déjà incluse dans la migration !

- **Vidéo principale** : Affichée dans le profil produit
- **Vidéo promo** : Affichée dans le feed (optionnelle)

### Configurer les Limites de Stockage

Par défaut, Supabase gratuit offre :
- 500 MB de stockage
- 2 GB de bande passante/mois

Pour augmenter, passe au plan Pro ($25/mois).

### Configurer l'Email

1. Va dans **Authentication > Email Templates**
2. Personnalise les emails de :
   - Confirmation d'inscription
   - Réinitialisation de mot de passe
   - Changement d'email

## 🐛 Dépannage

### Erreur : "Missing Supabase environment variables"

➡️ Vérifie que ton fichier `.env` contient bien les deux variables

### Erreur : "relation does not exist"

➡️ Tu n'as pas exécuté le script SQL. Retourne à l'Étape 4.

### Erreur : "JWT expired"

➡️ Ton token a expiré. Déconnecte-toi et reconnecte-toi.

### Erreur : "Storage bucket not found"

➡️ Le bucket "products" n'existe pas. Exécute cette requête SQL :

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;
```

### Les vidéos ne s'uploadent pas

➡️ Vérifie les policies du storage. Exécute :

```sql
-- Voir les policies actuelles
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### Erreur : "Foreign key violation"

➡️ Assure-toi que le profil de l'utilisateur existe avant de créer un produit.

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## 🎉 C'est Tout !

Ta base de données est maintenant configurée et prête à l'emploi !

Si tu rencontres des problèmes, vérifie :
1. ✅ Les variables d'environnement dans `.env`
2. ✅ Les tables dans Supabase Table Editor
3. ✅ Le bucket "products" dans Storage
4. ✅ Les policies RLS sont activées

**Bon développement ! 🚀**
