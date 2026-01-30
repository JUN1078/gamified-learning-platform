import { pool } from '../config/database.js';

async function addLevioFeatures() {
  const connection = await pool.getConnection();

  try {
    console.log('🚀 Adding Levio Features to LearnHub...\n');

    // ==================== LESSON SYSTEM ====================
    console.log('📚 Creating lesson system tables...');

    // 1. Lessons table (Read, Exercise, Exam)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('read', 'exercise', 'exam') NOT NULL,
        difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
        estimated_duration INT NOT NULL COMMENT 'Duration in minutes',
        xp_reward INT NOT NULL DEFAULT 10,
        coin_reward INT NOT NULL DEFAULT 5,
        cover_image VARCHAR(500),
        mountain_id VARCHAR(50) COMMENT 'Which ARISE mountain this belongs to',
        order_index INT NOT NULL DEFAULT 0,
        is_locked BOOLEAN DEFAULT false,
        unlock_requirement VARCHAR(255) COMMENT 'JSON: {type: "lesson", id: 123} or {type: "level", value: 5}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_mountain (mountain_id),
        INDEX idx_difficulty (difficulty)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Lesson content cards
    await connection.query(`
      CREATE TABLE IF NOT EXISTS lesson_cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        card_type ENUM('cover', 'content', 'collapsible', 'transition', 'question') NOT NULL,
        title VARCHAR(255),
        content TEXT,
        image_url VARCHAR(500),
        order_index INT NOT NULL,
        metadata JSON COMMENT 'Extra data: {expanded: false, transition_text: "Great job!"}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        INDEX idx_lesson_order (lesson_id, order_index)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Exercise questions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exercise_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        question_type ENUM('scrabble', 'slider', 'drag_drop', 'multiple_choice', 'checkbox', 'essay', 'swipe', 'ab_image', 'ab_option') NOT NULL,
        question_text TEXT NOT NULL,
        question_media VARCHAR(500),
        correct_answer TEXT NOT NULL COMMENT 'JSON array for answers',
        options JSON COMMENT 'Options for multiple choice, checkboxes, etc.',
        hints JSON COMMENT 'Array of hints',
        explanation TEXT COMMENT 'Explanation after answering',
        order_index INT NOT NULL,
        points INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        INDEX idx_lesson_order (lesson_id, order_index)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. User lesson progress
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_lesson_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        lesson_id INT NOT NULL,
        status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
        current_card_index INT DEFAULT 0,
        score INT DEFAULT 0 COMMENT 'For exercises and exams',
        answers JSON COMMENT 'User answers for review',
        time_spent INT DEFAULT 0 COMMENT 'Time in seconds',
        attempts INT DEFAULT 0,
        last_attempt_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_lesson (user_id, lesson_id),
        INDEX idx_user_status (user_id, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ==================== MISSION SYSTEM ====================
    console.log('🎯 Creating mission system tables...');

    // 5. Missions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS missions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('daily', 'weekly', 'special', 'achievement') NOT NULL,
        icon VARCHAR(100) DEFAULT '🎯',
        xp_reward INT NOT NULL DEFAULT 50,
        coin_reward INT NOT NULL DEFAULT 20,
        badge_reward VARCHAR(50) COMMENT 'Badge ID if earned',
        start_date TIMESTAMP NULL COMMENT 'For special missions',
        end_date TIMESTAMP NULL COMMENT 'For special missions',
        recurrence_rule VARCHAR(255) COMMENT 'For recurring missions: daily, weekly',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_active_dates (is_active, start_date, end_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Mission objectives
    await connection.query(`
      CREATE TABLE IF NOT EXISTS mission_objectives (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mission_id INT NOT NULL,
        description VARCHAR(255) NOT NULL,
        target_type VARCHAR(50) NOT NULL COMMENT 'lesson_complete, login_streak, xp_earned, etc.',
        target_value INT NOT NULL,
        order_index INT NOT NULL,
        FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
        INDEX idx_mission (mission_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. User mission progress
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_mission_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        mission_id INT NOT NULL,
        status ENUM('active', 'completed', 'expired') DEFAULT 'active',
        progress JSON COMMENT 'Progress per objective: {obj_id: current_value}',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        expires_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
        INDEX idx_user_status (user_id, status),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ==================== SOCIAL LEARNING ====================
    console.log('🤝 Creating social learning tables...');

    // 8. Social posts (feed)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS social_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        post_type ENUM('achievement', 'question', 'discussion', 'tip') NOT NULL,
        content TEXT NOT NULL,
        media_url VARCHAR(500),
        related_lesson_id INT NULL,
        likes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        is_pinned BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (related_lesson_id) REFERENCES lessons(id) ON DELETE SET NULL,
        INDEX idx_type_created (post_type, created_at DESC),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 9. Post comments
    await connection.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        is_answer BOOLEAN DEFAULT false COMMENT 'For Q&A posts',
        likes_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES social_posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_post (post_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 10. Post likes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NULL,
        comment_id INT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES social_posts(id) ON DELETE CASCADE,
        FOREIGN KEY (comment_id) REFERENCES post_comments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_post_like (user_id, post_id),
        UNIQUE KEY unique_comment_like (user_id, comment_id),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ==================== REWARD SYSTEM ====================
    console.log('🎁 Creating reward/gift system tables...');

    // 11. Rewards catalog
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rewards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('voucher', 'physical', 'digital', 'premium_feature') NOT NULL,
        image_url VARCHAR(500),
        cost_coins INT NOT NULL,
        stock INT DEFAULT -1 COMMENT '-1 for unlimited',
        is_active BOOLEAN DEFAULT true,
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_active_cost (is_active, cost_coins)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 12. User reward redemptions
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_rewards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        reward_id INT NOT NULL,
        status ENUM('pending', 'approved', 'delivered', 'used') DEFAULT 'pending',
        redemption_code VARCHAR(100) UNIQUE,
        redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivered_at TIMESTAMP NULL,
        expires_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE,
        INDEX idx_user_status (user_id, status),
        INDEX idx_redemption_code (redemption_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 13. Notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL COMMENT 'mission_complete, reward_available, new_comment, etc.',
        title VARCHAR(255) NOT NULL,
        message TEXT,
        action_url VARCHAR(500),
        icon VARCHAR(100),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_read (user_id, is_read, created_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ==================== ADD COINS TO USERS ====================
    console.log('💰 Adding coins column to users table...');

    // Check if xp column exists, if not add both xp and coins
    const [xpColumns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'xp'
    `);

    const [coinsColumns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'coins'
    `);

    // Add xp column if it doesn't exist
    if ((xpColumns as any[]).length === 0) {
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN xp INT DEFAULT 0
      `);
      console.log('✅ Added xp column to users table');
    }

    // Add coins column if it doesn't exist
    if ((coinsColumns as any[]).length === 0) {
      await connection.query(`
        ALTER TABLE users
        ADD COLUMN coins INT DEFAULT 0
      `);
      console.log('✅ Added coins column to users table');
    }

    console.log('✅ All tables created successfully!\n');

    // ==================== INSERT SAMPLE DATA ====================
    console.log('📝 Inserting sample data...\n');

    // Sample Read Lesson
    const [readLessonResult] = await connection.query(`
      INSERT INTO lessons (title, description, type, difficulty, estimated_duration, xp_reward, coin_reward, cover_image, mountain_id, order_index)
      VALUES (
        'Introduction to Agility',
        'Learn the fundamentals of agile thinking and adaptability',
        'read',
        'beginner',
        5,
        15,
        10,
        '/assets/lessons/agility-intro.jpg',
        'agility',
        1
      )
    `);
    const readLessonId = (readLessonResult as any).insertId;

    // Add cards for Read lesson
    await connection.query(`
      INSERT INTO lesson_cards (lesson_id, card_type, title, content, order_index, metadata)
      VALUES
        (${readLessonId}, 'cover', 'Introduction to Agility', 'Welcome to your first lesson on agile thinking!', 0, '{"duration": "5 min"}'),
        (${readLessonId}, 'content', 'What is Agility?', 'Agility is the ability to move quickly and adapt to changing circumstances. In learning and work, it means being flexible and responsive.', 1, NULL),
        (${readLessonId}, 'collapsible', 'Key Principles', 'Embrace change, iterate quickly, learn from feedback, stay curious.', 2, '{"expanded": false}'),
        (${readLessonId}, 'transition', 'Great Progress!', 'You are halfway through this lesson. Keep going!', 3, '{"emoji": "🚀"}'),
        (${readLessonId}, 'content', 'Agility in Practice', 'Examples: Switching strategies when needed, learning new tools quickly, adapting to team changes.', 4, NULL)
    `);

    // Sample Exercise Lesson
    const [exerciseLessonResult] = await connection.query(`
      INSERT INTO lessons (title, description, type, difficulty, estimated_duration, xp_reward, coin_reward, mountain_id, order_index)
      VALUES (
        'Agility Challenge',
        'Test your understanding of agile principles',
        'exercise',
        'beginner',
        3,
        20,
        15,
        'agility',
        2
      )
    `);
    const exerciseLessonId = (exerciseLessonResult as any).insertId;

    // Add exercise questions
    await connection.query(`
      INSERT INTO exercise_questions (lesson_id, question_type, question_text, correct_answer, options, explanation, order_index, points)
      VALUES
        (
          ${exerciseLessonId},
          'multiple_choice',
          'What is the key characteristic of agile thinking?',
          '["Adaptability"]',
          '{"options": ["Rigidity", "Adaptability", "Predictability", "Stability"]}',
          'Agile thinking emphasizes adaptability and responsiveness to change.',
          1,
          10
        ),
        (
          ${exerciseLessonId},
          'drag_drop',
          'Match the agile principles to their descriptions',
          '[{"item": "Embrace Change", "target": "Accept new ideas"}, {"item": "Iterate", "target": "Improve continuously"}]',
          '{"items": ["Embrace Change", "Iterate"], "targets": ["Accept new ideas", "Improve continuously"]}',
          'Great job matching the principles!',
          2,
          15
        ),
        (
          ${exerciseLessonId},
          'scrabble',
          'Unscramble the word: IILYAGTT',
          '["AGILITY"]',
          '{"scrambled": "IILYAGTT", "letters": ["A", "G", "I", "L", "I", "T", "Y"]}',
          'AGILITY is the ability to move and adapt quickly!',
          3,
          10
        )
    `);

    // Sample Exam Lesson
    const [examLessonResult] = await connection.query(`
      INSERT INTO lessons (title, description, type, difficulty, estimated_duration, xp_reward, coin_reward, mountain_id, order_index)
      VALUES (
        'Agility Mastery Exam',
        'Final assessment of your agility knowledge',
        'exam',
        'intermediate',
        10,
        50,
        30,
        'agility',
        3
      )
    `);
    const examLessonId = (examLessonResult as any).insertId;

    // Add exam questions
    await connection.query(`
      INSERT INTO exercise_questions (lesson_id, question_type, question_text, correct_answer, options, order_index, points)
      VALUES
        (
          ${examLessonId},
          'multiple_choice',
          'Which of these best describes an agile learner?',
          '["Someone who adapts quickly to new information"]',
          '{"options": ["Someone who sticks to one method", "Someone who adapts quickly to new information", "Someone who avoids change", "Someone who prefers routine"]}',
          1,
          20
        ),
        (
          ${examLessonId},
          'checkbox',
          'Select all characteristics of agile thinking: (Multiple answers)',
          '["Flexibility", "Continuous learning", "Openness to feedback"]',
          '{"options": ["Flexibility", "Rigidity", "Continuous learning", "Resistance to change", "Openness to feedback"]}',
          2,
          30
        )
    `);

    // Sample Missions
    await connection.query(`
      INSERT INTO missions (title, description, type, icon, xp_reward, coin_reward, recurrence_rule)
      VALUES
        ('Daily Learner', 'Complete 1 lesson today', 'daily', '📚', 30, 10, 'daily'),
        ('Weekly Warrior', 'Complete 5 lessons this week', 'weekly', '⚔️', 100, 50, 'weekly'),
        ('Social Butterfly', 'Post 3 times in the community', 'daily', '🦋', 20, 5, 'daily')
    `);

    // Get mission IDs
    const [dailyMission] = await connection.query(`SELECT id FROM missions WHERE title = 'Daily Learner' LIMIT 1`);
    const dailyMissionId = (dailyMission as any)[0].id;

    const [weeklyMission] = await connection.query(`SELECT id FROM missions WHERE title = 'Weekly Warrior' LIMIT 1`);
    const weeklyMissionId = (weeklyMission as any)[0].id;

    const [socialMission] = await connection.query(`SELECT id FROM missions WHERE title = 'Social Butterfly' LIMIT 1`);
    const socialMissionId = (socialMission as any)[0].id;

    // Add mission objectives
    await connection.query(`
      INSERT INTO mission_objectives (mission_id, description, target_type, target_value, order_index)
      VALUES
        (${dailyMissionId}, 'Complete any lesson', 'lesson_complete', 1, 1),
        (${weeklyMissionId}, 'Complete 5 lessons', 'lesson_complete', 5, 1),
        (${socialMissionId}, 'Make 3 posts', 'post_create', 3, 1)
    `);

    // Sample Rewards
    await connection.query(`
      INSERT INTO rewards (name, description, type, cost_coins, category)
      VALUES
        ('$10 Amazon Gift Card', 'Redeem for a $10 Amazon voucher', 'voucher', 500, 'gift_cards'),
        ('Premium Avatar Frame', 'Exclusive golden avatar frame', 'digital', 100, 'cosmetics'),
        ('1 Month Premium', 'Access to premium features for 1 month', 'premium_feature', 300, 'subscriptions'),
        ('LearnHub T-Shirt', 'Official LearnHub branded t-shirt', 'physical', 800, 'merchandise')
    `);

    console.log('✅ Sample data inserted successfully!\n');
    console.log('🎉 Levio features setup complete!\n');
    console.log('Summary:');
    console.log('- ✅ 13 new tables created');
    console.log('- ✅ Lesson system (Read, Exercise, Exam)');
    console.log('- ✅ Mission system with objectives');
    console.log('- ✅ Social learning (posts, comments, likes)');
    console.log('- ✅ Reward redemption system');
    console.log('- ✅ Notifications');
    console.log('- ✅ Sample data added\n');

  } catch (error) {
    console.error('❌ Error setting up Levio features:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

addLevioFeatures();
