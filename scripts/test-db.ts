import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

console.log('Testing database connection...');
console.log('DATABASE_URL:', DATABASE_URL ? 'Set' : 'Not set');

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to database...');
    const client = await pool.connect();
    console.log('✅ Successfully connected to database!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query test successful:', result.rows[0]);
    
    client.release();
    await pool.end();
    
    console.log('🎉 Database connection test passed!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

testConnection(); 