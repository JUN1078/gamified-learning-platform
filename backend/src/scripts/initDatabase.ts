import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const initDatabase = async () => {
  try {
    // Connect without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('🔗 Connected to MySQL server');

    const dbName = process.env.DB_NAME || 'learnhub_gamification';

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database "${dbName}" created/verified`);

    // Use the database
    await connection.query(`USE ${dbName}`);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table "users" created/verified');

    // Create characters table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS characters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE NOT NULL,

        -- 12 Attributes
        leadership DECIMAL(3,1) DEFAULT 5.0,
        creativity DECIMAL(3,1) DEFAULT 5.0,
        communication DECIMAL(3,1) DEFAULT 5.0,
        teamwork DECIMAL(3,1) DEFAULT 5.0,
        problem_solving DECIMAL(3,1) DEFAULT 5.0,
        innovation DECIMAL(3,1) DEFAULT 5.0,
        adaptability DECIMAL(3,1) DEFAULT 5.0,
        technical_skills DECIMAL(3,1) DEFAULT 5.0,
        critical_thinking DECIMAL(3,1) DEFAULT 5.0,
        empathy DECIMAL(3,1) DEFAULT 5.0,
        resilience DECIMAL(3,1) DEFAULT 5.0,
        strategic_thinking DECIMAL(3,1) DEFAULT 5.0,

        -- Avatar data
        base_character VARCHAR(100) DEFAULT 'default',
        sash VARCHAR(100) DEFAULT NULL,
        badges JSON DEFAULT NULL,
        accessories JSON DEFAULT NULL,

        -- Progression
        title VARCHAR(100) DEFAULT 'Novice Explorer',
        level INT DEFAULT 1,
        xp INT DEFAULT 0,
        next_level_xp INT DEFAULT 100,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_level (level)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table "characters" created/verified');

    // Create mountains table (for future use)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS mountains (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        color VARCHAR(50),
        attributes JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table "mountains" created/verified');

    // Create user_mountain_progress table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_mountain_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        mountain_id VARCHAR(50) NOT NULL,
        current_checkpoint INT DEFAULT 0,
        completed_checkpoints JSON,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (mountain_id) REFERENCES mountains(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_mountain (user_id, mountain_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table "user_mountain_progress" created/verified');

    // Insert default mountains
    const mountains = [
      { id: 'aggressive', name: 'Aggressive', description: 'The Driving Force', color: '#FF6B6B', attributes: JSON.stringify(['leadership', 'problemSolving']) },
      { id: 'respect', name: 'Respect', description: 'The Heart of the Team', color: '#CD7F32', attributes: JSON.stringify(['empathy', 'communication']) },
      { id: 'innovative', name: 'Innovative', description: 'The Visionary', color: '#B8C5D6', attributes: JSON.stringify(['innovation', 'creativity']) },
      { id: 'swift', name: 'Swift', description: 'The Quick Adaptor', color: '#2196F3', attributes: JSON.stringify(['adaptability', 'criticalThinking']) },
      { id: 'empowered', name: 'Empowered', description: 'The Independent Spirit', color: '#4CAF50', attributes: JSON.stringify(['resilience', 'strategicThinking']) },
    ];

    for (const mountain of mountains) {
      await connection.query(
        `INSERT INTO mountains (id, name, description, color, attributes)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)`,
        [mountain.id, mountain.name, mountain.description, mountain.color, mountain.attributes]
      );
    }
    console.log('✅ Default mountains inserted/updated');

    console.log('\n🎉 Database initialization complete!');
    console.log('\n📋 Tables created:');
    console.log('   - users');
    console.log('   - characters');
    console.log('   - mountains');
    console.log('   - user_mountain_progress');
    console.log('\n✨ Ready to start the server!\n');

    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database initialization error:', error.message);
    process.exit(1);
  }
};

initDatabase();
