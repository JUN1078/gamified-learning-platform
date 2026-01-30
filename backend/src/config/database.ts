import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL if provided
let poolConfig: any;

if (process.env.DATABASE_URL) {
  // Parse the DATABASE_URL
  const dbUrl = new URL(process.env.DATABASE_URL);
  const decodedPassword = decodeURIComponent(dbUrl.password);
  console.log('🔧 Parsing DATABASE_URL:');
  console.log('  Host:', dbUrl.hostname);
  console.log('  Port:', dbUrl.port || 3306);
  console.log('  User:', dbUrl.username);
  console.log('  Database:', dbUrl.pathname.slice(1));
  console.log('  Password length:', dbUrl.password?.length || 0);
  console.log('  Password starts with:', dbUrl.password?.substring(0, 3) + '...');
  console.log('  Decoded password starts with:', decodedPassword.substring(0, 3) + '...');

  poolConfig = {
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 3306,
    user: dbUrl.username,
    password: decodedPassword, // Use decoded password
    database: dbUrl.pathname.slice(1), // Remove leading '/'
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'learnhub_gamification',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  };
}

// Create connection pool
export const pool = mysql.createPool(poolConfig);

// Test database connection
export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    console.log(`📊 Database: ${process.env.DB_NAME || 'learnhub_gamification'}`);
    connection.release();
  } catch (error: any) {
    console.error('❌ MySQL connection error:', error.message);
    process.exit(1);
  }
};

export default pool;
