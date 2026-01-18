-- Drop existing tables if they exist (clean start)
DROP TABLE IF EXISTS quiz_responses;
DROP TABLE IF EXISTS quiz_options;
DROP TABLE IF EXISTS quiz_questions;

-- Create quiz questions table
CREATE TABLE quiz_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_text TEXT NOT NULL,
    question_type ENUM('MULTIPLE_CHOICE', 'YES_NO') NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    order_number INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create quiz options table
CREATE TABLE quiz_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    risk_score INT NOT NULL DEFAULT 0,
    order_number INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

-- Create quiz responses table
CREATE TABLE quiz_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_score INT NOT NULL,
    risk_level VARCHAR(50),
    answers JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample quiz questions

-- Question 1
INSERT INTO quiz_questions (id, question_text, question_type, order_number) VALUES 
(1, 'Avez-vous eu des rapports sexuels non protégés au cours des 6 derniers mois?', 'YES_NO', 1);

INSERT INTO quiz_options (question_id, option_text, risk_score, order_number) VALUES
(1, 'Oui', 25, 1),
(1, 'Non', 0, 2);

-- Question 2
INSERT INTO quiz_questions (id, question_text, question_type, order_number) VALUES 
(2, 'Combien de partenaires sexuels avez-vous eu au cours de la dernière année?', 'MULTIPLE_CHOICE', 2);

INSERT INTO quiz_options (question_id, option_text, risk_score, order_number) VALUES
(2, 'Aucun', 0, 1),
(2, '1 partenaire', 5, 2),
(2, '2-3 partenaires', 15, 3),
(2, 'Plus de 3 partenaires', 25, 4);

-- Question 3
INSERT INTO quiz_questions (id, question_text, question_type, order_number) VALUES 
(3, 'Avez-vous déjà fait un test de dépistage du VIH?', 'MULTIPLE_CHOICE', 3);

INSERT INTO quiz_options (question_id, option_text, risk_score, order_number) VALUES
(3, 'Oui, récemment (moins de 6 mois)', 0, 1),
(3, 'Oui, mais il y a longtemps (plus de 6 mois)', 10, 2),
(3, 'Non, jamais', 20, 3);

-- Question 4
INSERT INTO quiz_questions (id, question_text, question_type, order_number) VALUES 
(4, 'Consommez-vous des drogues injectables?', 'YES_NO', 4);

INSERT INTO quiz_options (question_id, option_text, risk_score, order_number) VALUES
(4, 'Oui', 30, 1),
(4, 'Non', 0, 2);

-- Question 5
INSERT INTO quiz_questions (id, question_text, question_type, order_number) VALUES 
(5, 'Avez-vous eu des symptômes inhabituels récemment? (fièvre prolongée, perte de poids inexpliquée, fatigue extrême)', 'YES_NO', 5);

INSERT INTO quiz_options (question_id, option_text, risk_score, order_number) VALUES
(5, 'Oui', 15, 1),
(5, 'Non', 0, 2);

-- Question 6
INSERT INTO quiz_questions (id, question_text, question_type, order_number) VALUES 
(6, 'Connaissez-vous le statut VIH de votre/vos partenaire(s)?', 'MULTIPLE_CHOICE', 6);

INSERT INTO quiz_options (question_id, option_text, risk_score, order_number) VALUES
(6, 'Oui, VIH négatif', 0, 1),
(6, 'Oui, VIH positif', 20, 2),
(6, 'Je ne sais pas', 15, 3),
(6, 'Je n\'ai pas de partenaire actuel', 0, 4);

-- Question 7
INSERT INTO quiz_questions (id, question_text, question_type, order_number) VALUES 
(7, 'À quelle fréquence utilisez-vous des préservatifs?', 'MULTIPLE_CHOICE', 7);

INSERT INTO quiz_options (question_id, option_text, risk_score, order_number) VALUES
(7, 'Toujours', 0, 1),
(7, 'Souvent', 10, 2),
(7, 'Parfois', 20, 3),
(7, 'Rarement', 25, 4),
(7, 'Jamais', 30, 5);

-- Question 8
INSERT INTO quiz_questions (id, question_text, question_type, order_number) VALUES 
(8, 'Avez-vous déjà eu une infection sexuellement transmissible (IST)?', 'YES_NO', 8);

INSERT INTO quiz_options (question_id, option_text, risk_score, order_number) VALUES
(8, 'Oui', 15, 1),
(8, 'Non', 0, 2);
