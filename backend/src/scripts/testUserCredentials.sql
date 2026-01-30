-- =====================================================
-- TEST USER CREDENTIALS FOR LEARNHUB
-- =====================================================
-- Email:    test@learnhub.com
-- Password: test123
-- Username: testuser
-- =====================================================

-- First, delete any existing test user (in case running multiple times)
DELETE FROM characters WHERE user_id IN (SELECT id FROM users WHERE email = 'test@learnhub.com');
DELETE FROM user_mountain_progress WHERE user_id IN (SELECT id FROM users WHERE email = 'test@learnhub.com');
DELETE FROM user_badges WHERE user_id IN (SELECT id FROM users WHERE email = 'test@learnhub.com');
DELETE FROM quest_progress WHERE user_id IN (SELECT id FROM users WHERE email = 'test@learnhub.com');
DELETE FROM lesson_progress WHERE user_id IN (SELECT id FROM users WHERE email = 'test@learnhub.com');
DELETE FROM mission_progress WHERE user_id IN (SELECT id FROM users WHERE email = 'test@learnhub.com');
DELETE FROM posts WHERE user_id IN (SELECT id FROM users WHERE email = 'test@learnhub.com');
DELETE FROM comments WHERE user_id IN (SELECT id FROM users WHERE email = 'test@learnhub.com');
DELETE FROM reward_redemptions WHERE user_id IN (SELECT id FROM users WHERE email = 'test@learnhub.com');
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email = 'test@learnhub.com');
DELETE FROM users WHERE email = 'test@learnhub.com';

-- Insert test user with bcrypt hashed password for "test123"
INSERT INTO users (email, username, password, created_at, updated_at)
VALUES (
  'test@learnhub.com',
  'testuser',
  '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa',  -- bcrypt hash of "test123"
  NOW(),
  NOW()
);

-- Create character for test user
INSERT INTO characters (user_id, level, experience, coins, health, max_health, mana, max_mana, attack, defense, created_at, updated_at)
VALUES (
  LAST_INSERT_ID(),
  1,
  0,
  100,
  100,
  100,
  50,
  50,
  10,
  10,
  NOW(),
  NOW()
);

-- Verify the test user was created
SELECT
  u.id,
  u.email,
  u.username,
  c.level,
  c.experience,
  c.coins
FROM users u
LEFT JOIN characters c ON u.id = c.user_id
WHERE u.email = 'test@learnhub.com';
