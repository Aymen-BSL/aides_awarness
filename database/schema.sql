-- Base de données pour la plateforme AIDES
-- MySQL Schema

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS aides_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aides_db;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('USER', 'MEDICAL_PROFESSIONAL', 'ADMIN') DEFAULT 'USER',
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des articles
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image VARCHAR(255),
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
    author_id INT NOT NULL,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_author (author_id),
    INDEX idx_published (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des likes d'articles
CREATE TABLE IF NOT EXISTS article_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    article_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (user_id, article_id),
    INDEX idx_article (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des commentaires d'articles
CREATE TABLE IF NOT EXISTS article_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    article_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    INDEX idx_article (article_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des catégories de forum
CREATE TABLE IF NOT EXISTS forum_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des posts de forum
CREATE TABLE IF NOT EXISTS forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category_id INT NOT NULL,
    author_id INT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_author (author_id),
    INDEX idx_pinned (is_pinned),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des commentaires de forum
CREATE TABLE IF NOT EXISTS forum_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    post_id INT NOT NULL,
    author_id INT NOT NULL,
    parent_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES forum_comments(id) ON DELETE CASCADE,
    INDEX idx_post (post_id),
    INDEX idx_author (author_id),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des votes (posts et commentaires)
CREATE TABLE IF NOT EXISTS forum_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NULL,
    comment_id INT NULL,
    vote_value TINYINT NOT NULL CHECK (vote_value IN (-1, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES forum_comments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_vote (user_id, post_id),
    UNIQUE KEY unique_comment_vote (user_id, comment_id),
    INDEX idx_post (post_id),
    INDEX idx_comment (comment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des quiz
CREATE TABLE IF NOT EXISTS quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des questions de quiz
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT NOT NULL,
    question TEXT NOT NULL,
    question_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quiz (quiz_id),
    INDEX idx_order (question_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des options de quiz
CREATE TABLE IF NOT EXISTS quiz_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    risk_score INT NOT NULL DEFAULT 0,
    option_order INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
    INDEX idx_question (question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des résultats de quiz
CREATE TABLE IF NOT EXISTS quiz_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    total_score INT NOT NULL,
    risk_level ENUM('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH') NOT NULL,
    answers JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_quiz (quiz_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer un admin par défaut (mot de passe: admin123)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@aides.fr', 'admin123', 'ADMIN');

-- Insérer des catégories de forum par défaut
INSERT INTO forum_categories (name, description, icon) VALUES
('Général', 'Discussions générales sur le SIDA et la prévention', 'comments'),
('Témoignages', 'Partagez vos expériences', 'heart'),
('Questions/Réponses', 'Posez vos questions', 'question-circle'),
('Ressources', 'Partagez des ressources utiles', 'book');

-- Insérer un quiz par défaut
INSERT INTO quizzes (title, description, is_active) VALUES
('Évaluation des risques VIH/SIDA', 'Ce quiz vous aide à évaluer votre niveau de risque concernant le VIH/SIDA', TRUE);

-- Questions et options du quiz (exemple simple)
SET @quiz_id = LAST_INSERT_ID();

INSERT INTO quiz_questions (quiz_id, question, question_order) VALUES
(@quiz_id, 'Avez-vous eu des rapports sexuels non protégés au cours des 6 derniers mois ?', 1),
(@quiz_id, 'Avez-vous partagé des seringues ou du matériel d\'injection ?', 2),
(@quiz_id, 'Avez-vous eu plusieurs partenaires sexuels ?', 3),
(@quiz_id, 'Avez-vous déjà été testé pour le VIH ?', 4);

-- Options pour la question 1
INSERT INTO quiz_options (question_id, option_text, risk_score, option_order) VALUES
((SELECT id FROM quiz_questions WHERE question_order = 1 AND quiz_id = @quiz_id), 'Non, jamais', 0, 1),
((SELECT id FROM quiz_questions WHERE question_order = 1 AND quiz_id = @quiz_id), 'Oui, une fois', 5, 2),
((SELECT id FROM quiz_questions WHERE question_order = 1 AND quiz_id = @quiz_id), 'Oui, plusieurs fois', 10, 3);

-- Options pour la question 2
INSERT INTO quiz_options (question_id, option_text, risk_score, option_order) VALUES
((SELECT id FROM quiz_questions WHERE question_order = 2 AND quiz_id = @quiz_id), 'Non', 0, 1),
((SELECT id FROM quiz_questions WHERE question_order = 2 AND quiz_id = @quiz_id), 'Oui', 15, 2);

-- Options pour la question 3
INSERT INTO quiz_options (question_id, option_text, risk_score, option_order) VALUES
((SELECT id FROM quiz_questions WHERE question_order = 3 AND quiz_id = @quiz_id), 'Non, un seul partenaire', 0, 1),
((SELECT id FROM quiz_questions WHERE question_order = 3 AND quiz_id = @quiz_id), 'Oui, 2-3 partenaires', 3, 2),
((SELECT id FROM quiz_questions WHERE question_order = 3 AND quiz_id = @quiz_id), 'Oui, plus de 3 partenaires', 7, 3);

-- Options pour la question 4
INSERT INTO quiz_options (question_id, option_text, risk_score, option_order) VALUES
((SELECT id FROM quiz_questions WHERE question_order = 4 AND quiz_id = @quiz_id), 'Oui, récemment (moins de 6 mois)', -5, 1),
((SELECT id FROM quiz_questions WHERE question_order = 4 AND quiz_id = @quiz_id), 'Oui, il y a plus de 6 mois', 0, 2),
((SELECT id FROM quiz_questions WHERE question_order = 4 AND quiz_id = @quiz_id), 'Non, jamais', 5, 3);
