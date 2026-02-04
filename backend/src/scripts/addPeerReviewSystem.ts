import { pool } from '../config/database.js';
import { RowDataPacket } from 'mysql2';

async function addPeerReviewSystem() {
  const connection = await pool.getConnection();

  try {
    console.log('🚀 Starting Peer Review System setup...');
    await connection.beginTransaction();

    // 1. Create arise_dimensions table
    console.log('Creating arise_dimensions table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS arise_dimensions (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(50),
        mountain_id VARCHAR(50),
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mountain_id) REFERENCES mountains(id) ON DELETE SET NULL,
        INDEX idx_order (order_index)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 2. Create arise_statements table (Likert questions)
    console.log('Creating arise_statements table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS arise_statements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dimension_id VARCHAR(50) NOT NULL,
        statement_text TEXT NOT NULL,
        statement_type ENUM('positive', 'negative') DEFAULT 'positive',
        order_index INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dimension_id) REFERENCES arise_dimensions(id) ON DELETE CASCADE,
        INDEX idx_dimension_order (dimension_id, order_index),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. Create peer_reviews table
    console.log('Creating peer_reviews table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS peer_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        reviewer_id INT NOT NULL,
        reviewee_id INT NOT NULL,
        review_cycle VARCHAR(50),
        overall_comment TEXT,
        status ENUM('draft', 'submitted', 'acknowledged') DEFAULT 'submitted',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_reviewer (reviewer_id),
        INDEX idx_reviewee (reviewee_id),
        INDEX idx_cycle (review_cycle),
        INDEX idx_submitted (submitted_at DESC),
        CHECK (reviewer_id != reviewee_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. Create peer_review_ratings table
    console.log('Creating peer_review_ratings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS peer_review_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        review_id INT NOT NULL,
        statement_id INT NOT NULL,
        dimension_id VARCHAR(50) NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (review_id) REFERENCES peer_reviews(id) ON DELETE CASCADE,
        FOREIGN KEY (statement_id) REFERENCES arise_statements(id) ON DELETE CASCADE,
        FOREIGN KEY (dimension_id) REFERENCES arise_dimensions(id) ON DELETE CASCADE,
        INDEX idx_review (review_id),
        INDEX idx_dimension (dimension_id),
        CHECK (rating >= 1 AND rating <= 5)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 5. Create user_arise_scores table (aggregated scores)
    console.log('Creating user_arise_scores table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_arise_scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        dimension_id VARCHAR(50) NOT NULL,
        average_score DECIMAL(3,2) DEFAULT 0.00,
        total_reviews INT DEFAULT 0,
        last_review_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (dimension_id) REFERENCES arise_dimensions(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_dimension (user_id, dimension_id),
        INDEX idx_user (user_id),
        INDEX idx_dimension (dimension_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 6. Create arise_badges table
    console.log('Creating arise_badges table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS arise_badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        badge_type ENUM('dimension_master', 'reviewer_active', 'team_player', 'growth', 'special') NOT NULL,
        dimension_id VARCHAR(50),
        icon VARCHAR(100),
        color VARCHAR(50),
        rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
        criteria JSON NOT NULL,
        xp_reward INT DEFAULT 0,
        coin_reward INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dimension_id) REFERENCES arise_dimensions(id) ON DELETE SET NULL,
        INDEX idx_type (badge_type),
        INDEX idx_rarity (rarity),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 7. Create user_arise_badges table
    console.log('Creating user_arise_badges table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_arise_badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        badge_id INT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        progress_data JSON,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (badge_id) REFERENCES arise_badges(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_badge (user_id, badge_id),
        INDEX idx_user (user_id),
        INDEX idx_earned (earned_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 8. Create arise_learning_modules table
    console.log('Creating arise_learning_modules table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS arise_learning_modules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dimension_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        module_type ENUM('flashcard', 'do_dont', 'quiz', 'scenario', 'reflection') NOT NULL,
        content JSON NOT NULL,
        estimated_duration INT DEFAULT 5,
        xp_reward INT DEFAULT 10,
        order_index INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dimension_id) REFERENCES arise_dimensions(id) ON DELETE CASCADE,
        INDEX idx_dimension_order (dimension_id, order_index),
        INDEX idx_type (module_type),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 9. Create user_arise_learning_progress table
    console.log('Creating user_arise_learning_progress table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_arise_learning_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        module_id INT NOT NULL,
        status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
        score INT DEFAULT 0,
        time_spent INT DEFAULT 0,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (module_id) REFERENCES arise_learning_modules(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_module (user_id, module_id),
        INDEX idx_user_status (user_id, status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========================================
    // INSERT DEFAULT DATA
    // ========================================

    // Check if arise_dimensions already has data
    const [existingDimensions] = await connection.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM arise_dimensions'
    );

    if (existingDimensions[0].count === 0) {
      console.log('Inserting ARISE dimensions...');
      await connection.query(`
        INSERT INTO arise_dimensions (id, name, description, icon, color, mountain_id, order_index) VALUES
        ('aggressive', 'Aggressive (Driving Force)', 'Takes initiative, drives results, and leads with determination', '⚡', '#FF6B6B', 'aggressive', 1),
        ('respect', 'Respect (Heart of Team)', 'Shows empathy, values diversity, and treats everyone with dignity', '❤️', '#4ECDC4', 'respect', 2),
        ('innovative', 'Innovative (Visionary)', 'Thinks creatively, challenges status quo, and embraces new ideas', '💡', '#FFE66D', 'innovative', 3),
        ('ownership', 'Spirit of Ownership (Empowered)', 'Takes responsibility, commits fully, and goes beyond expectations', '🎯', '#A8E6CF', 'empowered', 4),
        ('excellence', 'Excellence (Swift & Adaptable)', 'Delivers quality, adapts quickly, and continuously improves', '⭐', '#FFB6C1', 'swift', 5)
      `);
    }

    // Check if arise_statements already has data
    const [existingStatements] = await connection.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM arise_statements'
    );

    if (existingStatements[0].count === 0) {
      console.log('Inserting ARISE behavioral statements...');

      // AGGRESSIVE statements
      await connection.query(`
        INSERT INTO arise_statements (dimension_id, statement_text, statement_type, order_index) VALUES
        ('aggressive', 'Takes initiative to solve problems without waiting to be asked', 'positive', 1),
        ('aggressive', 'Drives projects forward and keeps team focused on goals', 'positive', 2),
        ('aggressive', 'Makes decisions confidently even in uncertain situations', 'positive', 3),
        ('aggressive', 'Challenges team to achieve ambitious targets', 'positive', 4),
        ('aggressive', 'Proactively identifies and addresses obstacles', 'positive', 5)
      `);

      // RESPECT statements
      await connection.query(`
        INSERT INTO arise_statements (dimension_id, statement_text, statement_type, order_index) VALUES
        ('respect', 'Listens actively and values others\\' perspectives', 'positive', 1),
        ('respect', 'Treats all team members with dignity and fairness', 'positive', 2),
        ('respect', 'Shows empathy and understanding in difficult situations', 'positive', 3),
        ('respect', 'Celebrates diversity and creates an inclusive environment', 'positive', 4),
        ('respect', 'Provides constructive feedback with kindness', 'positive', 5)
      `);

      // INNOVATIVE statements
      await connection.query(`
        INSERT INTO arise_statements (dimension_id, statement_text, statement_type, order_index) VALUES
        ('innovative', 'Proposes creative solutions to complex problems', 'positive', 1),
        ('innovative', 'Encourages experimentation and learning from failures', 'positive', 2),
        ('innovative', 'Challenges conventional thinking and processes', 'positive', 3),
        ('innovative', 'Stays curious and explores new technologies/methods', 'positive', 4),
        ('innovative', 'Transforms ideas into actionable plans', 'positive', 5)
      `);

      // OWNERSHIP statements
      await connection.query`
        INSERT INTO arise_statements (dimension_id, statement_text, statement_type, order_index) VALUES
        ('ownership', 'Takes full accountability for work and outcomes', 'positive', 1),
        ('ownership', 'Goes above and beyond job responsibilities', 'positive', 2),
        ('ownership', 'Follows through on commitments consistently', 'positive', 3),
        ('ownership', 'Takes pride in quality of work delivered', 'positive', 4),
        ('ownership', 'Acts like an owner, not just an employee', 'positive', 5)
      `;

      // EXCELLENCE statements
      await connection.query(`
        INSERT INTO arise_statements (dimension_id, statement_text, statement_type, order_index) VALUES
        ('excellence', 'Delivers high-quality work that exceeds expectations', 'positive', 1),
        ('excellence', 'Adapts quickly to changing priorities and situations', 'positive', 2),
        ('excellence', 'Continuously seeks to improve skills and knowledge', 'positive', 3),
        ('excellence', 'Maintains high standards even under pressure', 'positive', 4),
        ('excellence', 'Learns from mistakes and implements improvements', 'positive', 5)
      `);
    }

    // Insert ARISE badges
    const [existingBadges] = await connection.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM arise_badges'
    );

    if (existingBadges[0].count === 0) {
      console.log('Inserting ARISE badges...');
      await connection.query(`
        INSERT INTO arise_badges (name, description, badge_type, dimension_id, icon, color, rarity, criteria, xp_reward, coin_reward) VALUES
        ('First Review', 'Complete your first peer review', 'reviewer_active', NULL, '🌟', '#FFD700', 'common', '{"reviews_given": 1}', 50, 20),
        ('Active Reviewer', 'Complete 5 peer reviews', 'reviewer_active', NULL, '📝', '#4ECDC4', 'rare', '{"reviews_given": 5}', 100, 50),
        ('Review Champion', 'Complete 20 peer reviews', 'reviewer_active', NULL, '🏆', '#FF6B6B', 'epic', '{"reviews_given": 20}', 500, 200),

        ('Aggressive Master', 'Achieve 4.5+ average in Aggressive dimension', 'dimension_master', 'aggressive', '⚡', '#FF6B6B', 'epic', '{"dimension": "aggressive", "min_score": 4.5, "min_reviews": 3}', 200, 100),
        ('Respect Master', 'Achieve 4.5+ average in Respect dimension', 'dimension_master', 'respect', '❤️', '#4ECDC4', 'epic', '{"dimension": "respect", "min_score": 4.5, "min_reviews": 3}', 200, 100),
        ('Innovation Master', 'Achieve 4.5+ average in Innovative dimension', 'dimension_master', 'innovative', '💡', '#FFE66D', 'epic', '{"dimension": "innovative", "min_score": 4.5, "min_reviews": 3}', 200, 100),
        ('Ownership Master', 'Achieve 4.5+ average in Spirit of Ownership', 'dimension_master', 'ownership', '🎯', '#A8E6CF', 'epic', '{"dimension": "ownership", "min_score": 4.5, "min_reviews": 3}', 200, 100),
        ('Excellence Master', 'Achieve 4.5+ average in Excellence dimension', 'dimension_master', 'excellence', '⭐', '#FFB6C1', 'epic', '{"dimension": "excellence", "min_score": 4.5, "min_reviews": 3}', 200, 100),

        ('ARISE Legend', 'Achieve 4.5+ in ALL dimensions', 'special', NULL, '👑', '#FFD700', 'legendary', '{"all_dimensions_min": 4.5, "min_reviews": 5}', 1000, 500),
        ('Team Player', 'Receive 10+ positive reviews', 'team_player', NULL, '🤝', '#A8E6CF', 'rare', '{"reviews_received": 10, "min_avg": 4.0}', 300, 150),
        ('Rising Star', 'Improve average score by 1.0 in any dimension', 'growth', NULL, '🌠', '#FFB6C1', 'rare', '{"score_improvement": 1.0}', 250, 125)
      `);
    }

    await connection.commit();
    console.log('✅ Peer Review System setup complete!');
    console.log('');
    console.log('📊 Tables created:');
    console.log('   - arise_dimensions (5 dimensions)');
    console.log('   - arise_statements (25 behavioral statements)');
    console.log('   - peer_reviews');
    console.log('   - peer_review_ratings');
    console.log('   - user_arise_scores');
    console.log('   - arise_badges (11 badges)');
    console.log('   - user_arise_badges');
    console.log('   - arise_learning_modules');
    console.log('   - user_arise_learning_progress');

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error setting up Peer Review System:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addPeerReviewSystem()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default addPeerReviewSystem;
