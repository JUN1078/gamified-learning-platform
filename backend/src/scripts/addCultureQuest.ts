import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const addCultureQuestTables = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
      user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
    });

    console.log('🔗 Connected to MySQL');

    // 1. Culture Dimensions Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS culture_dimensions (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(50),
        weight DECIMAL(3,2) DEFAULT 1.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table "culture_dimensions" created');

    // 2. Quest Scenarios Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS culture_scenarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('scenario', 'emotion', 'value_tradeoff', 'reflection') NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        context VARCHAR(100),
        trigger_after VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table "culture_scenarios" created');

    // 3. Scenario Options Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS culture_scenario_options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        scenario_id INT NOT NULL,
        option_text TEXT NOT NULL,
        option_label VARCHAR(10),
        emoji VARCHAR(10),
        dimension_id VARCHAR(50),
        likert_value DECIMAL(2,1) NOT NULL,
        option_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scenario_id) REFERENCES culture_scenarios(id) ON DELETE CASCADE,
        FOREIGN KEY (dimension_id) REFERENCES culture_dimensions(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table "culture_scenario_options" created');

    // 4. User Responses Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS culture_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        scenario_id INT NOT NULL,
        option_id INT NOT NULL,
        dimension_id VARCHAR(50),
        likert_value DECIMAL(2,1),
        context_data JSON,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (scenario_id) REFERENCES culture_scenarios(id),
        FOREIGN KEY (option_id) REFERENCES culture_scenario_options(id),
        FOREIGN KEY (dimension_id) REFERENCES culture_dimensions(id),
        INDEX idx_user_id (user_id),
        INDEX idx_dimension (dimension_id),
        INDEX idx_completed_at (completed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table "culture_responses" created');

    // 5. User Culture Scores (Aggregated)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_culture_scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        dimension_id VARCHAR(50) NOT NULL,
        current_score DECIMAL(3,2) DEFAULT 0.00,
        response_count INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (dimension_id) REFERENCES culture_dimensions(id),
        UNIQUE KEY unique_user_dimension (user_id, dimension_id),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table "user_culture_scores" created');

    // Insert Default Culture Dimensions
    const dimensions = [
      { id: 'learning_engagement', name: 'Learning Engagement', description: 'Enthusiasm and consistency in learning', icon: '🚀', color: '#4CAF50', weight: 1.00 },
      { id: 'growth_mindset', name: 'Growth Mindset', description: 'Willingness to learn and improve', icon: '🌱', color: '#8BC34A', weight: 1.00 },
      { id: 'ownership', name: 'Ownership', description: 'Proactive vs passive behavior', icon: '🎯', color: '#FFC107', weight: 1.00 },
      { id: 'collaboration', name: 'Collaboration', description: 'Preference for teamwork', icon: '🤝', color: '#2196F3', weight: 1.00 },
      { id: 'resilience', name: 'Resilience', description: 'Response to failure and challenges', icon: '💪', color: '#FF9800', weight: 1.00 },
      { id: 'cultural_alignment', name: 'Cultural Alignment', description: 'Alignment with organizational values', icon: '⭐', color: '#9C27B0', weight: 1.00 },
    ];

    for (const dim of dimensions) {
      await connection.query(
        `INSERT INTO culture_dimensions (id, name, description, icon, color, weight)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)`,
        [dim.id, dim.name, dim.description, dim.icon, dim.color, dim.weight]
      );
    }
    console.log('✅ Default culture dimensions inserted');

    // Insert Sample Scenarios
    const scenarios = [
      {
        type: 'scenario',
        title: 'Team Behind Schedule',
        description: 'Your team is behind on the project deadline. What do you do?',
        context: 'after_lesson',
        trigger_after: 'lesson_complete',
      },
      {
        type: 'emotion',
        title: 'Lesson Reflection',
        description: 'After completing this lesson, how do you feel?',
        context: 'after_lesson',
        trigger_after: 'lesson_complete',
      },
      {
        type: 'value_tradeoff',
        title: 'Work Priority',
        description: 'Which value do you prioritize most in your work?',
        context: 'weekly',
        trigger_after: 'week_complete',
      },
    ];

    for (const scenario of scenarios) {
      const [result] = await connection.query(
        `INSERT INTO culture_scenarios (type, title, description, context, trigger_after)
         VALUES (?, ?, ?, ?, ?)`,
        [scenario.type, scenario.title, scenario.description, scenario.context, scenario.trigger_after]
      );

      const scenarioId = (result as any).insertId;

      // Add options based on type
      if (scenario.type === 'scenario') {
        const options = [
          { text: 'Focus on finishing my own tasks first', label: 'A', dimension: 'ownership', likert: 3.0, order: 1 },
          { text: 'Initiate team discussion and ask for help', label: 'B', dimension: 'collaboration', likert: 5.0, order: 2 },
          { text: 'Wait for mentor guidance', label: 'C', dimension: 'growth_mindset', likert: 2.0, order: 3 },
          { text: 'Skip for now and continue later', label: 'D', dimension: 'resilience', likert: 1.0, order: 4 },
        ];

        for (const opt of options) {
          await connection.query(
            `INSERT INTO culture_scenario_options (scenario_id, option_text, option_label, dimension_id, likert_value, option_order)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [scenarioId, opt.text, opt.label, opt.dimension, opt.likert, opt.order]
          );
        }
      } else if (scenario.type === 'emotion') {
        const emotions = [
          { emoji: '😐', text: 'Neutral', dimension: 'learning_engagement', likert: 1.0, order: 1 },
          { emoji: '😶', text: 'Unsure', dimension: 'learning_engagement', likert: 2.0, order: 2 },
          { emoji: '🙂', text: 'Good', dimension: 'learning_engagement', likert: 3.0, order: 3 },
          { emoji: '😄', text: 'Great', dimension: 'learning_engagement', likert: 4.0, order: 4 },
          { emoji: '🚀', text: 'Excited', dimension: 'learning_engagement', likert: 5.0, order: 5 },
        ];

        for (const emo of emotions) {
          await connection.query(
            `INSERT INTO culture_scenario_options (scenario_id, option_text, emoji, dimension_id, likert_value, option_order)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [scenarioId, emo.text, emo.emoji, emo.dimension, emo.likert, emo.order]
          );
        }
      } else if (scenario.type === 'value_tradeoff') {
        const values = [
          { emoji: '🚀', text: 'Speed', dimension: 'ownership', likert: 4.0, order: 1 },
          { emoji: '🎯', text: 'Accuracy', dimension: 'growth_mindset', likert: 4.0, order: 2 },
          { emoji: '🤝', text: 'Collaboration', dimension: 'collaboration', likert: 5.0, order: 3 },
          { emoji: '🌱', text: 'Exploration', dimension: 'learning_engagement', likert: 4.0, order: 4 },
        ];

        for (const val of values) {
          await connection.query(
            `INSERT INTO culture_scenario_options (scenario_id, option_text, emoji, dimension_id, likert_value, option_order)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [scenarioId, val.text, val.emoji, val.dimension, val.likert, val.order]
          );
        }
      }
    }
    console.log('✅ Sample scenarios and options inserted');

    console.log('\n🎉 Culture Quest tables created successfully!');
    console.log('\n📋 New Tables:');
    console.log('   - culture_dimensions (6 default dimensions)');
    console.log('   - culture_scenarios (quest scenarios)');
    console.log('   - culture_scenario_options (answer choices)');
    console.log('   - culture_responses (user responses)');
    console.log('   - user_culture_scores (aggregated scores)');
    console.log('\n✨ Sample data inserted!\n');

    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

addCultureQuestTables();
