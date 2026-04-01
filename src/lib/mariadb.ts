import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig: mysql.PoolOptions = {
  host: process.env.MARIADB_HOST || 'localhost',
  port: parseInt(process.env.MARIADB_PORT || '3306'),
  user: process.env.MARIADB_USER || 'root',
  password: process.env.MARIADB_PASSWORD || '',
  database: process.env.MARIADB_DATABASE || 'realestate_crm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true
  } : undefined
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('✅ MariaDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MariaDB connection failed:', error);
    return false;
  }
}

// Execute query with error handling
export async function query(sql: string, params?: any[]) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Execute multiple queries in transaction
export async function transaction(queries: Array<{ sql: string; params?: any[] }>) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { sql, params } of queries) {
      const [result] = await connection.execute(sql, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Close database connection
export async function closeConnection() {
  try {
    await pool.end();
    console.log('✅ MariaDB connection closed');
  } catch (error) {
    console.error('Error closing MariaDB connection:', error);
  }
}

export default pool;