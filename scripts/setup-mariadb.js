#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Real Estate CRM MariaDB Setup');
console.log('================================\n');

// Check if mysql is installed
function checkMySQL() {
  try {
    execSync('mysql --version', { stdio: 'ignore' });
    console.log('✅ MySQL/MariaDB client found');
    return true;
  } catch (error) {
    console.log('❌ MySQL/MariaDB client not found');
    console.log('Please install MySQL or MariaDB client first:');
    console.log('  Ubuntu/Debian: sudo apt-get install mysql-client');
    console.log('  CentOS/RHEL: sudo yum install mysql');
    console.log('  macOS: brew install mysql-client');
    console.log('  Windows: Download from https://dev.mysql.com/downloads/installer/');
    return false;
  }
}

// Create .env.local file
function createEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = `# MariaDB Database Configuration
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_USER=your_username
MARIADB_PASSWORD=your_password
MARIADB_DATABASE=realestate_crm

# Optional: Enable SSL for production
# MARIADB_SSL=true

# Application Configuration
NODE_ENV=development
`;

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
    console.log('📝 Please update the database credentials in .env.local');
  } else {
    console.log('⚠️  .env.local already exists');
  }
}

// Run database migration
async function runMigration() {
  try {
    console.log('🔄 Running database migration...');
    
    // Import and run migration
    const { runMigration } = require('../src/lib/migrate');
    const success = await runMigration();
    
    if (success) {
      console.log('✅ Database migration completed');
    } else {
      console.log('❌ Database migration failed');
      console.log('Please check the database connection and try again');
    }
    
    return success;
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    return false;
  }
}

// Install dependencies
function installDependencies() {
  try {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
    return true;
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    return false;
  }
}

// Main setup function
async function main() {
  console.log('Step 1: Checking MySQL/MariaDB client...');
  if (!checkMySQL()) {
    process.exit(1);
  }

  console.log('\nStep 2: Creating environment file...');
  createEnvFile();

  console.log('\nStep 3: Installing dependencies...');
  if (!installDependencies()) {
    process.exit(1);
  }

  console.log('\nStep 4: Setting up database...');
  console.log('Please ensure your MariaDB server is running and accessible.');
  console.log('You will need to provide database credentials in .env.local');
  
  const proceed = require('readline-sync').question('\nDo you want to proceed with database setup? (y/n): ');
  
  if (proceed.toLowerCase() === 'y') {
    const success = await runMigration();
    if (success) {
      console.log('\n🎉 Setup completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Update database credentials in .env.local');
      console.log('2. Run: npm run dev');
      console.log('3. Visit: http://localhost:3000');
    } else {
      console.log('\n❌ Setup failed. Please check the errors above.');
      process.exit(1);
    }
  } else {
    console.log('\n⚠️  Database setup skipped.');
    console.log('Remember to run the migration manually when ready:');
    console.log('node src/lib/migrate.ts');
  }
}

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run setup
main().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});