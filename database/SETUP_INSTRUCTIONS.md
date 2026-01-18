# Instructions de configuration de la base de données

## Étape 1: Accéder à phpMyAdmin

1. Ouvrez votre navigateur
2. Allez à: `http://localhost/phpmyadmin`
3. Connectez-vous (par défaut: username = `root`, pas de mot de passe)

## Étape 2: Créer la base de données

### Option A: Via l'interface graphique

1. Cliquez sur "Nouvelle base de données" dans le menu de gauche
2. Nom: `aides_db`
3. Interclassement: `utf8mb4_unicode_ci`
4. Cliquez sur "Créer"

### Option B: Via SQL

1. Cliquez sur l'onglet "SQL"
2. Copiez le contenu du fichier `database/schema.sql`
3. Collez-le dans le champ de requête
4. Cliquez sur "Exécuter"

## Étape 3: Vérifier la création

Vous devriez voir dans `aides_db`:

- ✅ Table `users` (avec 1 admin par défaut)
- ✅ Table `articles`
- ✅ Table `article_likes`
- ✅ Table `article_comments`
- ✅ Table `forum_categories` (avec 4 catégories)
- ✅ Table `forum_posts`
- ✅ Table `forum_comments`
- ✅ Table `forum_votes`
- ✅ Table `quizzes` (avec 1 quiz)
- ✅ Table `quiz_questions` (avec 4 questions)
- ✅ Table `quiz_options`
- ✅ Table `quiz_results`

## Compte admin par défaut

- **Email**: admin@aides.fr
- **Mot de passe**: admin123
- **Rôle**: ADMIN

## Étape 4: Déplacer le projet vers XAMPP (optionnel)

Pour faciliter le développement, vous pouvez déplacer le projet vers:

```
C:\xampp\htdocs\aids\
```

Ensuite accéder via: `http://localhost/aids/public/index.html`

## Étape 5: Tester l'API

Une fois la base de données créée:

1. Ouvrez: `http://localhost/aids/public/inscription.html`
2. Créez un compte de test
3. Connectez-vous avec ce compte
4. Vérifiez que vous êtes redirigé vers le dashboard

## Résolution de problèmes

### Erreur: "Table doesn't exist"

- Assurez-vous que le fichier SQL a bien été exécuté
- Vérifiez que vous êtes dans la base de données `aides_db`

### Erreur: "Access denied"

- Vérifiez que MySQL est démarré dans XAMPP Control Panel
- Username par défaut: `root`, mot de passe: vide

### Erreur 404 sur les API

- Assurez-vous que le projet est bien dans `C:\xampp\htdocs\`
- Vérifiez les chemins dans les URLs

## URLs importantes

- **phpMyAdmin**: http://localhost/phpmyadmin
- **Application**: http://localhost/aids/public/index.html
- **Test API Register**: http://localhost/aids/api/auth/register.php
- **Test API Login**: http://localhost/aids/api/auth/login.php
