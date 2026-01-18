# 🎗️ AIDES - Plateforme de Sensibilisation contre le SIDA

Une plateforme web complète en français dédiée à la prévention et la sensibilisation contre le SIDA, avec système d'articles, forums, quiz interactifs, et fonctionnalités de dons.

## ✨ Fonctionnalités Complètes

### 🔐 Authentification & Autorisation

- Système de connexion/inscription avec JWT
- 3 rôles utilisateur: **Utilisateur**, **Professionnel Médical**, **Administrateur**
- Protection des routes et API avec JWT
- Gestion de profil utilisateur

### 📰 Système d'Articles

- Consultation d'articles par tous les utilisateurs
- Création et gestion d'articles (Admin/Professionnel Médical)
- Système de like sur articles
- Commentaires avec modération
- Catégories d'articles
- Statut brouillon/publié
- Upload d'images de couverture (URL ou fichier)

### 💬 Forums de Discussion

- Création de posts de discussion
- Système de commentaires
- Likes sur posts et commentaires
- Modération par admins

### 📝 Système de Quiz

- Quiz interactifs à choix multiples
- Gestion de quiz (création, édition, suppression)
- Gestion des questions par quiz
- Activation/désactivation de quiz
- Scoring automatique

### 💝 Système de Dons (Fake)

- Dons simulés aux admins et professionnels médicaux
- Montants prédéfinis ou personnalisés (5€-1000€)
- Messages optionnels
- Statistiques de donations
- Historique des dons donnés/reçus
- UI role-based (onglets pour donneurs vs receveurs)

### 👥 Gestion des Utilisateurs (Admin)

- Liste complète des utilisateurs
- Édition de profils utilisateur
- Changement de rôles
- Système de bannissement (temporaire/permanent)
- Suppression d'utilisateurs
- Statistiques utilisateurs

### 🎨 Dashboard Moderne

- Sidebar navigation fixe avec scroll caché
- Design dark theme professionnel
- Navigation par onglets dynamique
- Interface responsive
- Animations et transitions fluides
- Badges colorés par rôle:
  - 🔴 Admin: Rouge
  - 🔵 Professionnel Médical: Bleu
  - ⚪ Utilisateur: Gris

## 🛠️ Stack Technique

### Frontend

- **HTML5** - Structure sémantique
- **JavaScript Vanilla** - Logique côté client (pas de framework)
- **TailwindCSS** (CDN) - Styling moderne avec thème dark personnalisé
- **Font Awesome 6** - Icônes
- **Fetch API** - Communication avec le backend

### Backend

- **PHP 8.x** - API REST
- **MySQL** - Base de données relationnelle
- **PDO** - Accès sécurisé à la base de données avec prepared statements
- **JWT personnalisé** - Authentification par token
- **XAMPP** - Environnement de développement local

### Sécurité

- Validation des entrées côté serveur
- Protection CSRF
- Prepared statements (protection SQL injection)
- Authentification JWT
- Contrôle d'accès basé sur les rôles (RBAC)

## 📁 Structure du Projet

```
aids/
├── api/                              # API Backend PHP
│   ├── auth/
│   │   ├── login.php                # Connexion
│   │   ├── register.php             # Inscription
│   │   └── me.php                   # Profil utilisateur
│   ├── articles/
│   │   ├── list.php                 # Liste articles publiés
│   │   ├── detail.php               # Détails article
│   │   ├── like.php                 # Like article
│   │   └── comments/                # Gestion commentaires
│   ├── admin/
│   │   ├── articles/                # Gestion articles (CRUD)
│   │   └── users/                   # Gestion utilisateurs
│   ├── forums/
│   │   ├── list.php                 # Liste posts forum
│   │   ├── create.php               # Créer post
│   │   └── comments/                # Commentaires forum
│   ├── quiz/
│   │   ├── get.php                  # Récupérer quiz actifs
│   │   ├── create.php               # Créer quiz
│   │   ├── update.php               # Modifier quiz
│   │   └── questions/               # Gestion questions
│   ├── donations/
│   │   ├── create.php               # Créer don
│   │   ├── recipients.php           # Liste destinataires
│   │   ├── stats.php                # Stats dons reçus
│   │   └── my-donations.php         # Historique dons
│   └── profile/
│       └── update.php               # Mise à jour profil
├── config/
│   ├── database.php                 # Configuration DB
│   └── jwt.php                      # Gestion JWT
├── database/
│   ├── schema.sql                   # Schéma complet de la DB
│   ├── add_quiz_active_column.sql   # Migration quiz
│   ├── fix_quiz_columns.sql         # Migration questions
│   ├── add_article_category.sql     # Migration articles
│   └── create_donations_table.sql   # Migration dons
├── public/                           # Frontend
│   ├── index.html                   # Page d'accueil
│   ├── pages/
│   │   ├── login.html               # Connexion
│   │   ├── register.html            # Inscription
│   │   └── dashboard/
│   │       └── index.html           # Dashboard principal
│   ├── js/
│   │   ├── auth.js                  # Authentification
│   │   ├── dashboard.js             # Logique dashboard
│   │   └── components/              # Composants JS
│   │       ├── articleFeed.js       # Feed articles
│   │       ├── articleManagement.js # Gestion articles
│   │       ├── forums.js            # Forums
│   │       ├── quiz.js              # Quiz utilisateur
│   │       ├── quizManagement.js    # Gestion quiz
│   │       ├── donations.js         # Système dons
│   │       ├── settings.js          # Paramètres
│   │       └── adminManagement.js   # Gestion utilisateurs
│   ├── assets/
│   │   └── images/
│   │       └── logo.png             # Logo AIDES
│   └── uploads/
│       └── articles/                # Images articles uploadées
└── README.md
```

## 🎨 Design System

### Palette de Couleurs

```css
--primary: #dc2626 /* Rouge AIDES */ --dark: #0f0f1e /* Background principal */
  --dark-card: #1a1a2e /* Cartes et sidebar */ --text-primary: #ffffff
  --text-secondary: #9ca3af --success: #10b981 --error: #ef4444;
```

### Composants UI

- Sidebar navigation fixe (280px)
- Cartes avec ombres et hover effects
- Formulaires dark theme
- Badges de rôle colorés
- Modales centrées
- Messages de succès/erreur
- Scrollbar caché mais fonctionnel

## 🗄️ Base de Données

### Tables Principales

- `users` - Utilisateurs avec rôles et bannissement
- `articles` - Articles avec catégories et statuts
- `article_likes` - Likes sur articles
- `article_comments` - Commentaires articles
- `forum_posts` - Posts de forum
- `forum_comments` - Commentaires forum
- `forum_likes` - Likes forum
- `quizzes` - Quiz avec statut actif
- `quiz_questions` - Questions de quiz
- `donations` - Dons simulés

## 🚀 Installation

### Prérequis

- XAMPP (PHP 8.x, MySQL)
- Git
- Navigateur web moderne

### Étapes

1. **Cloner le projet**

```bash
git clone https://github.com/Aymen-BSL/aides_awarness.git
cd aides_awarness
```

2. **Configurer XAMPP**

- Démarrer Apache et MySQL
- Accéder à phpMyAdmin: `http://localhost/phpmyadmin`

3. **Créer la base de données**

```sql
CREATE DATABASE aides_db;
USE aides_db;
```

4. **Importer le schéma**

- Importer `database/schema.sql` via phpMyAdmin
- Appliquer les migrations dans l'ordre

5. **Copier les fichiers vers XAMPP**

```bash
xcopy . C:\xampp\htdocs\aids\ /E /I /H /Y
```

6. **Accéder à l'application**

- Page d'accueil: `http://localhost/aids/public/index.html`
- Dashboard: `http://localhost/aids/public/pages/dashboard/index.html`

### Compte Admin par Défaut

```
Email: admin@aides.com
Mot de passe: admin123
```

## 👥 Rôles et Permissions

### 🔹 Utilisateur Normal

- ✅ Lire articles et forums
- ✅ Commenter et liker
- ✅ Passer les quiz
- ✅ Faire des dons
- ✅ Gérer son profil

### 🔷 Professionnel Médical

- ✅ Tout ce que fait un utilisateur
- ✅ Créer et gérer ses articles
- ✅ Créer et gérer des quiz
- ✅ Recevoir des dons

### 🔴 Administrateur

- ✅ Tout ce que fait un professionnel médical
- ✅ Gérer tous les articles
- ✅ Gérer tous les quiz
- ✅ Gérer tous les utilisateurs
- ✅ Bannir/débannir des utilisateurs
- ✅ Changer les rôles
- ✅ Recevoir des dons

## 🎯 Fonctionnalités Clés

### Navigation Dashboard

- **Général**: Accueil, Articles, Forum, Quiz
- **Communauté**: Dons
- **Gestion** (Admin/Medical): Utilisateurs, Gestion Quiz, Gestion Articles
- **Profil**: Paramètres, Déconnexion

### Système de Dons

- Interface double pour les receveurs:
  - **Faire un Don**: Donner à d'autres
  - **Dons Reçus**: Voir statistiques et historique
- Montants prédéfinis: 10€, 25€, 50€, 100€
- Montant personnalisé: 5€ - 1000€
- Nom de donateur optionnel
- Message d'encouragement optionnel

### Gestion d'Articles

- Upload d'image via URL ou fichier local
- Prévisualisation d'image
- Statut brouillon/publié
- Catégories personnalisables
- Filtres par statut

## 🔧 Configuration

### API Base URL

Les chemins API utilisent le préfixe `/aids/api/` pour XAMPP.

### JWT Configuration

Token stocké dans `localStorage` avec expiration de 24h.

## 📝 Notes Importantes

- Les mots de passe sont **hachés** en base de données (sécurité)
- JWT personnalisé (pas de bibliothèque externe)
- Upload d'images limité à 5MB
- Format d'images: JPG, PNG, GIF, WebP
- Interface 100% en français

## 🌐 Technologies Web

- Pas de framework JS (Vanilla JavaScript)
- TailwindCSS via CDN (pas de build)
- PHP natif (pas de framework)
- MySQL avec PDO
- Architecture MVC côté frontend

## 🎉 Statut du Projet

**✅ COMPLÉTÉ** - Application entièrement fonctionnelle

Toutes les fonctionnalités principales sont implémentées et testées:

- ✅ Authentication & Authorization
- ✅ Articles avec CRUD complet
- ✅ Forums avec commentaires
- ✅ Quiz interactifs avec gestion
- ✅ Système de dons
- ✅ Gestion utilisateurs
- ✅ Dashboard moderne avec sidebar
- ✅ Upload d'images
- ✅ API REST complète

---

**Développé par**: Aymen & Hela  
**Date**: Janvier 2026  
**Licence**: MIT  
**Statut**: ✅ Production Ready
