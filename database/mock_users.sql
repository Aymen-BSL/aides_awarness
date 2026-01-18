-- Mock users for testing ban functionality
-- All passwords are: test123

INSERT INTO users (username, email, password, first_name, last_name, role, created_at) VALUES
('testuser1', 'test1@example.com', 'test123', 'Jean', 'Dupont', 'USER', NOW()),
('testuser2', 'test2@example.com', 'test123', 'Marie', 'Martin', 'USER', NOW()),
('testuser3', 'test3@example.com', 'test123', 'Pierre', 'Bernard', 'USER', NOW()),
('testuser4', 'test4@example.com', 'test123', 'Sophie', 'Dubois', 'USER', NOW()),
('testuser5', 'test5@example.com', 'test123', 'Lucas', 'Robert', 'USER', NOW()),
('dr_martin', 'doctor@example.com', 'test123', 'Dr. Michel', 'Martin', 'MEDICAL_PROFESSIONAL', NOW()),
('moderator1', 'mod@example.com', 'test123', 'Admin', 'Moderateur', 'USER', NOW());

-- Optional: Add one pre-banned user for testing
-- INSERT INTO users (username, email, password, first_name, last_name, role, is_banned, ban_reason, banned_at, ban_until) VALUES
-- ('banneduser', 'banned@example.com', 'test123', 'User', 'Banni', 'USER', TRUE, 'Test de bannissement', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY));
