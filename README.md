# AIDES - Plateforme de sensibilisation contre le SIDA

Une plateforme web complète dédiée à la prévention et la sensibilisation contre le SIDA.

## 📋 État actuel du projet

### ✅ Complété (Frontend uniquement)

- Structure du projet
- Pages d'authentification (Connexion & Inscription)
- Tableau de bord de base avec navigation par onglets
- Système de design dark theme (basé sur Figma)
- Logique côté client pour l'authentification JWT

### ⏳ En attente (Backend PHP)

- Installation de XAMPP (en cours)
- Configuration de MySQL
- API backend PHP
- Schéma de base de données
- Fonctionnalités complètes

## 🛠️ Stack technique

### Frontend

- **HTML5** - Structure sémantique
- **JavaScript Vanilla** - Logique client
- **TailwindCSS** (CDN) - Styling avec dark theme
- **Font Awesome** - Icônes

### Backend (à venir)

- **PHP 8.x** - Serveur backend
- **MySQL** - Base de données (inclus avec XAMPP)
- **PDO** - Abstraction de la base de données
- **JWT** - Authentification par token

## 📁 Structure du projet

```
aids/
├── public/                         # Fichiers publics Frontend
│   ├── connexion.html             # Page de connexion
│   ├── inscription.html           # Page d'inscription
│   ├── css/                       # Styles personnalisés
│   ├── js/
│   │   ├── auth.js               # Logique d'authentification
│   │   ├── dashboard.js          # Logique du tableau de bord
│   │   ├── utils.js              # Fonctions utilitaires
│   │   └── components/           # Composants JS réutilisables
│   └── pages/
│       └── dashboard/
│           └── index.html        # Tableau de bord principal
├── api/                           # API Backend PHP (à créer)
│   ├── auth/
│   ├── articles/
│   ├── forums/
│   ├── quiz/
│   └── users/
├── config/                        # Configuration (à créer)
└── database/                      # Scripts SQL (à créer)
```

## 🎨 Design système

### Palette de couleurs

- **Background**: `#1A1A1A` (Dark charcoal)
- **Cards**: `#2D2D2D` (Dark gray)
- **Primary**: `#C4302B` (Red)
- **Text Primary**: `#FFFFFF` (White)
- **Text Secondary**: `#A0AEC0` (Light gray)

### Composants

- Navigation supérieure avec onglets
- Cartes avec coins arrondis et ombres
- Formulaires dark theme
- Boutons avec effets hover
- Menu utilisateur dropdown

## 🚀 Prochaines étapes

1. **Installer XAMPP** (en cours)
2. **Configurer MySQL**
   - Créer la base de données `aides_db`
   - Créer les tables (users, articles, forums, quiz, etc.)
3. **Créer l'API PHP**
   - Endpoints d'authentification
   - CRUD pour articles
   - Système de forum
   - Quiz d'évaluation
4. **Implémenter les fonctionnalités**
   - Feed d'articles
   - Forums (style Reddit)
   - Quiz de risque
   - Gestion admin

## 👥 Rôles utilisateur

### Utilisateur normal

- Lire les articles
- Participer aux forums
- Passer le quiz
- Modifier son profil

### Professionnel médical

- Tout ce que fait un utilisateur normal
- Créer et publier des articles
- Gérer ses propres articles

### Administrateur

- Tout ce que fait un professionnel médical
- Gérer tous les utilisateurs
- Promouvoir des utilisateurs
- Modérer le contenu
- Gérer forums et articles

## 🌐 Langue

L'application est développée en **français** selon le design Figma.

## 📝 Notes

- Les mots de passe ne sont **pas hachés** (pour simplifier le développement)
- L'authentification utilise **JWT** stocké dans localStorage
- Le design suit le thème dark du Figma fourni

---

**Créé par**: Hela
**Date**: Janvier 2026
**Statut**: En développement (Frontend complété, Backend en attente)
