# Real Estate CRM - MariaDB Setup Guide

This guide will help you set up MariaDB for your Real Estate CRM application and deploy it to various hosting platforms.

## 🚀 Quick Start

### 1. Local Development Setup

#### Prerequisites
- Node.js 18+ installed
- MariaDB/MySQL server installed and running
- Basic knowledge of command line

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Set up Database
```bash
# Run the automated setup script
node scripts/setup-mariadb.js
```

#### Step 3: Configure Environment
Edit the `.env.local` file created by the setup script:
```env
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_USER=your_username
MARIADB_PASSWORD=your_password
MARIADB_DATABASE=realestate_crm
NODE_ENV=development
```

#### Step 4: Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

---

## 🗄️ Database Installation

### Option 1: Local Installation

#### Windows
1. Download MariaDB installer from [mariadb.org](https://mariadb.org/download/)
2. Run the installer and follow the setup wizard
3. Note down the root password during installation
4. Start MariaDB service from Windows Services

#### macOS
```bash
# Using Homebrew
brew install mariadb
brew services start mariadb

# Secure installation
mysql_secure_installation
```

#### Ubuntu/Debian
```bash
# Install MariaDB
sudo apt update
sudo apt install mariadb-server mariadb-client

# Start and enable service
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Secure installation
sudo mysql_secure_installation
```

#### CentOS/RHEL
```bash
# Install MariaDB
sudo yum install mariadb-server mariadb

# Start and enable service
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Secure installation
sudo mysql_secure_installation
```

### Option 2: Docker
```bash
# Run MariaDB in Docker
docker run -d \
  --name mariadb-crm \
  -e MYSQL_ROOT_PASSWORD=your_root_password \
  -e MYSQL_DATABASE=realestate_crm \
  -e MYSQL_USER=crm_user \
  -e MYSQL_PASSWORD=your_password \
  -p 3306:3306 \
  mariadb:latest

# Connect to database
docker exec -it mariadb-crm mysql -u crm_user -p realestate_crm
```

---

## ☁️ Cloud Hosting Options

### 1. Railway (Recommended for beginners)

#### Step 1: Deploy to Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/real-estate-crm)

#### Step 2: Add Database
1. In Railway dashboard, click "New" → "Database"
2. Select "MariaDB" or "MySQL"
3. Railway will automatically create environment variables

#### Step 3: Configure Environment
Railway automatically sets:
- `DATABASE_URL` (connection string)
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`

#### Step 4: Run Migration
```bash
# In Railway console
node src/lib/migrate.ts
```

### 2. Vercel + PlanetScale

#### Step 1: Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/real-estate-crm)

#### Step 2: Set up PlanetScale
1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get connection credentials

#### Step 3: Configure Environment Variables
In Vercel dashboard, add:
```env
MARIADB_HOST=aws.connect.psdb.cloud
MARIADB_PORT=3306
MARIADB_USER=your_username
MARIADB_PASSWORD=your_password
MARIADB_DATABASE=your_database_name
MARIADB_SSL=true
NODE_ENV=production
```

### 3. DigitalOcean App Platform

#### Step 1: Create App
1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App" and connect your GitHub repository
3. Select the Real Estate CRM repository

#### Step 2: Add Database
1. In App settings, click "Add a Database"
2. Select "Managed Database"
3. Choose "MySQL" (compatible with MariaDB)
4. Select region and plan

#### Step 3: Configure Environment
DigitalOcean automatically sets database environment variables.

#### Step 4: Deploy
Click "Deploy App" and wait for deployment to complete.

### 4. AWS (Amazon Web Services)

#### Step 1: Set up RDS
1. Go to AWS RDS Console
2. Create a new MySQL database instance
3. Configure instance settings, security groups, and credentials

#### Step 2: Deploy Application
Use AWS Elastic Beanstalk, ECS, or EC2 to deploy your application.

#### Step 3: Configure Environment
Set environment variables with RDS connection details.

### 5. Google Cloud Platform

#### Step 1: Set up Cloud SQL
1. Go to Google Cloud Console
2. Create a new Cloud SQL MySQL instance
3. Configure instance settings and users

#### Step 2: Deploy Application
Use Google App Engine, Cloud Run, or Compute Engine.

#### Step 3: Configure Environment
Set environment variables with Cloud SQL connection details.

---

## 🔧 Manual Database Setup

### Create Database and User
```sql
-- Connect to MariaDB as root
mysql -u root -p

-- Create database
CREATE DATABASE realestate_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON realestate_crm.* TO 'crm_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

### Run Migration Manually
```bash
# Connect to database and run schema
mysql -u crm_user -p realestate_crm < src/lib/schema.sql
```

---

## 🛡️ Security Best Practices

### 1. Use Strong Passwords
- Generate strong, unique passwords for database users
- Use password managers to store credentials securely

### 2. Enable SSL/TLS
```env
MARIADB_SSL=true
```

### 3. Firewall Configuration
- Only allow connections from your application servers
- Use security groups or firewall rules to restrict access

### 4. Regular Backups
```bash
# Backup database
mysqldump -u username -p realestate_crm > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u username -p realestate_crm < backup_file.sql
```

### 5. Environment Variables
- Never commit `.env.local` to version control
- Use different credentials for development and production
- Rotate passwords regularly

---

## 🚨 Troubleshooting

### Common Issues

#### Connection Refused
```bash
# Check if MariaDB is running
sudo systemctl status mariadb

# Start MariaDB if stopped
sudo systemctl start mariadb
```

#### Authentication Failed
- Verify username and password in `.env.local`
- Check if user has proper permissions
- Ensure database exists

#### Port Already in Use
```bash
# Check what's using port 3306
sudo lsof -i :3306

# Stop conflicting service or change port in .env.local
```

#### SSL Connection Issues
```env
# For development, you can disable SSL
MARIADB_SSL=false

# For production, ensure SSL is properly configured
MARIADB_SSL=true
```

### Getting Help
- Check application logs: `npm run dev` output
- Check MariaDB logs: `/var/log/mysql/error.log`
- Test database connection: `mysql -u user -p database_name`

---

## 📊 Performance Optimization

### 1. Database Indexes
The schema includes essential indexes for performance. Monitor query performance and add more indexes as needed.

### 2. Connection Pooling
The application uses connection pooling with:
- Maximum 10 connections
- Automatic connection management
- Proper cleanup on errors

### 3. Query Optimization
- Use prepared statements (already implemented)
- Limit result sets for large tables
- Add pagination for long lists

### 4. Caching
Consider adding Redis for caching frequently accessed data.

---

## 🔄 Backup and Recovery

### Automated Backups
Set up automated daily backups:
```bash
#!/bin/bash
# backup.sh
mysqldump -u username -p realestate_crm | gzip > /backups/backup_$(date +%Y%m%d).sql.gz
```

### Recovery Process
1. Stop application
2. Restore from backup
3. Start application
4. Verify data integrity

---

## 📈 Monitoring

### Database Monitoring
- Monitor connection count
- Track slow queries
- Watch disk usage
- Set up alerts for critical issues

### Application Monitoring
- Monitor API response times
- Track database query performance
- Set up error tracking

---

## 🎯 Next Steps

1. **Customize**: Modify the schema to fit your specific business needs
2. **Scale**: Consider read replicas for high-traffic applications
3. **Security**: Implement additional security measures as needed
4. **Monitoring**: Set up comprehensive monitoring and alerting
5. **Backup**: Establish regular backup procedures

---

## 📞 Support

If you encounter issues:
1. Check this guide for solutions
2. Review application and database logs
3. Search GitHub issues for similar problems
4. Create a new issue with detailed information

---

*Last updated: March 2025*