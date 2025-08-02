import pool from '../src/lib/pg';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('Current time:', result.rows[0].current_time);
    
    // Test users table
    const usersResult = await pool.query('SELECT COUNT(*) as user_count FROM users');
    console.log('Users in database:', usersResult.rows[0].user_count);
    
    // Test tenants table
    const tenantsResult = await pool.query('SELECT COUNT(*) as tenant_count FROM tenants');
    console.log('Tenants in database:', tenantsResult.rows[0].tenant_count);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await pool.end();
  }
}

testConnection(); 