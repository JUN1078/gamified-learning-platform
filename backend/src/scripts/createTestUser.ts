import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createTestUser = async () => {
  console.log('🔧 Creating test user...\n');

  const connection = await mysql.createConnection({
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
  });

  try {
    // Test user credentials
    const testEmail = 'test@learnhub.com';
    const testUsername = 'testuser';
    const testPassword = 'test123'; // Plain password for login

    console.log('📧 Test User Credentials:');
    console.log('   Email:', testEmail);
    console.log('   Username:', testUsername);
    console.log('   Password:', testPassword);
    console.log('');

    // Check if user already exists
    const [existingUsers]: any = await connection.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [testEmail, testUsername]
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  Test user already exists. Deleting old test user...');
      const userId = existingUsers[0].id;

      // Delete related records first (foreign key constraints)
      await connection.query('DELETE FROM characters WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM user_mountain_progress WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM user_badges WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM quest_progress WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM lesson_progress WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM mission_progress WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM posts WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM comments WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM reward_redemptions WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM notifications WHERE user_id = ?', [userId]);

      // Delete the user
      await connection.query('DELETE FROM users WHERE id = ?', [userId]);
      console.log('✅ Old test user deleted\n');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testPassword, salt);

    // Create user
    console.log('👤 Creating user in database...');
    const [result]: any = await connection.query(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [testEmail, testUsername, hashedPassword]
    );

    const userId = result.insertId;
    console.log('✅ User created with ID:', userId);

    // Create character for user
    console.log('🎮 Creating character for user...');
    await connection.query(
      'INSERT INTO characters (user_id, level, experience, coins) VALUES (?, 1, 0, 100)',
      [userId]
    );
    console.log('✅ Character created');

    console.log('\n🎉 Test user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('Use these credentials to login:');
    console.log('Email:    test@learnhub.com');
    console.log('Password: test123');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await connection.end();
  }
};

createTestUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
