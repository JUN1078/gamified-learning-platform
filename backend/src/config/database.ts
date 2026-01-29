import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'learnhub_gamification',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

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
