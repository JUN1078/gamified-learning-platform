import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL if provided, otherwise fall back to individual variables
let poolConfig: any;

// Railway MySQL provides both MYSQL_URL and individual variables
// Try MYSQL_URL first, then DATABASE_URL, then individual variables
const mysqlUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

if (mysqlUrl) {
  try {
    // Parse the MySQL connection URL
    const dbUrl = new URL(mysqlUrl);

    console.log('🔧 Database Configuration:');
    console.log('  Using:', process.env.MYSQL_URL ? 'MYSQL_URL' : 'DATABASE_URL');
    console.log('  Host:', dbUrl.hostname);
    console.log('  Port:', dbUrl.port || 3306);
    console.log('  User:', dbUrl.username);
    console.log('  Database:', dbUrl.pathname.slice(1));
    console.log('  Password provided:', !!dbUrl.password);
    console.log('  Password length:', dbUrl.password?.length || 0);

    poolConfig = {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port) || 3306,
      user: dbUrl.username,
      password: dbUrl.password, // No need to decode - mysql2 handles it
      database: dbUrl.pathname.slice(1),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      connectTimeout: 10000,
    };
  } catch (error: any) {
    console.error('❌ Error parsing database URL:', error.message);
    console.log('Falling back to individual environment variables');
    poolConfig = buildConfigFromEnvVars();
  }
} else {
  console.log('🔧 Using individual environment variables');
  poolConfig = buildConfigFromEnvVars();
}

function buildConfigFromEnvVars() {
  return {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'learnhub_gamification',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 10000,
  };
}

// Create connection pool
export const pool = mysql.createPool(poolConfig);

// Test database connection with retry logic
export const connectDB = async () => {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Connection attempt ${attempt}/${maxRetries}...`);
      const connection = await pool.getConnection();
      console.log('✅ MySQL connected successfully');
      console.log(`📊 Database: ${poolConfig.database}`);
      console.log(`🌐 Host: ${poolConfig.host}:${poolConfig.port}`);
      connection.release();
      return;
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Connection attempt ${attempt} failed:`, error.message);

      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('');
        console.error('⚠️  ACCESS DENIED - Check these Railway settings:');
        console.error('1. In your MySQL service, go to Variables tab');
        console.error('2. Copy the MYSQL_URL value');
        console.error('3. In your backend service Variables, set:');
        console.error('   MYSQL_URL = ${{MySQL.MYSQL_URL}}');
        console.error('   (Use the reference syntax, not the actual URL)');
        console.error('');
        break; // No point retrying auth errors
      }

      if (attempt < maxRetries) {
        const delay = attempt * 2000; // Exponential backoff
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('');
  console.error('❌ Failed to connect to MySQL after', maxRetries, 'attempts');
  console.error('Last error:', lastError.message);
  console.error('');
  process.exit(1);
};

export default pool;
