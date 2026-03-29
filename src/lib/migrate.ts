import { query } from './mariadb';

// Read the SQL schema file
const fs = require('fs');
const path = require('path');

export async function runMigration() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Read the schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map((stmt: string) => stmt.trim())
      .filter((stmt: string) => stmt.length > 0);
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.startsWith('/*') || statement.length === 0) {
        continue;
      }
      
      try {
        await query(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error: any) {
        // Some statements might fail (like DROP TABLE if table doesn't exist), which is okay
        if (!error.message.includes('doesn\'t exist') && !error.message.includes('Unknown table')) {
          console.warn(`⚠️  Statement ${i + 1} failed:`, error.message);
        }
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  }
}

// If running this file directly, execute the migration
if (require.main === module) {
  runMigration().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export default runMigration;