import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Railway automatically shares MySQL service variables with connected services
// Use individual variables (more reliable than parsing URL)
console.log('🔧 Database Configuration:');
console.log('  Strategy: Using individual environment variables');
console.log('  MYSQLHOST:', process.env.MYSQLHOST || 'not set');
console.log('  MYSQLPORT:', process.env.MYSQLPORT || 'not set');
console.log('  MYSQLUSER:', process.env.MYSQLUSER || 'not set');
console.log('  MYSQLDATABASE:', process.env.MYSQLDATABASE || 'not set');
console.log('  MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? 'set (length: ' + process.env.MYSQLPASSWORD.length + ')' : 'not set');

const poolConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306'),
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,
};

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
