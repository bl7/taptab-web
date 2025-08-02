import pool from '../src/lib/pg';

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    // Check tenants table
    const tenantsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'tenants' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Tenants table structure:');
    tenantsResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });

    // Check users table
    const usersResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n👥 Users table structure:');
    usersResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });

    await pool.end();
  } catch (error) {
    console.error('❌ Error checking schema:', error);
    await pool.end();
  }
}

checkSchema(); 