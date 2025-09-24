# Car Rental Booking System - Deployment Guide

This guide covers deploying the Car Rental Booking System to production environments.

## Deployment Options

### 1. Traditional VPS/Server Deployment
### 2. Cloud Platform Deployment (Heroku, DigitalOcean, AWS)
### 3. Containerized Deployment (Docker)

## Prerequisites for Production

- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)
- Production database (MySQL 8.0+)
- Node.js runtime environment
- Process manager (PM2 recommended)
- Reverse proxy (Nginx recommended)

## Option 1: VPS/Server Deployment

### 1. Server Setup

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Install MySQL
```bash
sudo apt install mysql-server -y
sudo mysql_secure_installation
```

#### Install Nginx
```bash
sudo apt install nginx -y
```

#### Install PM2
```bash
sudo npm install -g pm2
```

### 2. Application Deployment

#### Clone Repository
```bash
cd /var/www
sudo git clone <your-repository-url> car-rental
cd car-rental
sudo chown -R $USER:$USER /var/www/car-rental
```

#### Backend Setup
```bash
cd backend
npm install --production
```

#### Create Production Environment File
```bash
nano .env.production
```

```env
# Production Environment Variables
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=car_rental_user
DB_PASS=secure_password_here
DB_NAME=car_rental_prod
DB_PORT=3306

# JWT Configuration
JWT_SECRET=super-secure-jwt-secret-for-production

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
FRONTEND_URL=https://yourdomain.com
```

#### Setup Database
```bash
mysql -u root -p
```

```sql
CREATE DATABASE car_rental_prod;
CREATE USER 'car_rental_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON car_rental_prod.* TO 'car_rental_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Build Frontend
```bash
cd ..
npm install
npm run build
```

### 3. PM2 Configuration

Create PM2 ecosystem file:
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'car-rental-backend',
    script: './backend/server.js',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

#### Start Application
```bash
mkdir logs
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 4. Nginx Configuration

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/car-rental
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    location / {
        root /var/www/car-rental/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (uploads)
    location /uploads {
        alias /var/www/car-rental/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/car-rental /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Option 2: Heroku Deployment

### 1. Prepare Application

#### Create Heroku-specific files

**Procfile:**
```
web: cd backend && npm start
```

**package.json (root):**
```json
{
  "name": "car-rental-booking-system",
  "version": "1.0.0",
  "scripts": {
    "build": "npm install && cd backend && npm install && cd .. && npm run build:frontend",
    "build:frontend": "npm run build",
    "start": "cd backend && npm start",
    "heroku-postbuild": "npm run build"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

### 2. Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secure-jwt-secret

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## Option 3: Docker Deployment

### 1. Create Dockerfiles

**Backend Dockerfile:**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
# Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2. Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: car_rental
      MYSQL_USER: car_rental_user
      MYSQL_PASSWORD: userpassword
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DB_HOST: mysql
      DB_USER: car_rental_user
      DB_PASS: userpassword
      DB_NAME: car_rental
      JWT_SECRET: your-jwt-secret
    ports:
      - "5000:5000"
    depends_on:
      - mysql
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Environment Variables for Production

### Required Variables
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASS=your-db-password
DB_NAME=your-db-name
JWT_SECRET=your-super-secure-jwt-secret
```

### Optional Variables
```env
FRONTEND_URL=https://yourdomain.com
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
CORS_ORIGIN=https://yourdomain.com
```

## Security Checklist

### Application Security
- [ ] Strong JWT secret (32+ characters)
- [ ] Environment variables properly set
- [ ] Database credentials secured
- [ ] CORS properly configured
- [ ] Input validation enabled
- [ ] File upload restrictions in place

### Server Security
- [ ] Firewall configured (UFW/iptables)
- [ ] SSH key authentication
- [ ] Regular security updates
- [ ] Non-root user for application
- [ ] SSL certificate installed
- [ ] Security headers configured

### Database Security
- [ ] Strong database passwords
- [ ] Database user with minimal privileges
- [ ] Regular backups configured
- [ ] Database not exposed to public

## Monitoring and Maintenance

### Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart car-rental-backend
```

### System Monitoring
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check Nginx status
sudo systemctl status nginx

# Check MySQL status
sudo systemctl status mysql
```

### Backup Strategy

#### Database Backup
```bash
# Create backup script
nano /home/user/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/user/backups"
DB_NAME="car_rental_prod"
DB_USER="car_rental_user"
DB_PASS="your_password"

mkdir -p $BACKUP_DIR
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/car_rental_$DATE.sql
gzip $BACKUP_DIR/car_rental_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "car_rental_*.sql.gz" -mtime +7 -delete
```

#### Automate Backups
```bash
chmod +x /home/user/backup-db.sh
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /home/user/backup-db.sh
```

## Performance Optimization

### Frontend Optimization
- Enable Gzip compression in Nginx
- Set proper cache headers
- Use CDN for static assets
- Optimize images

### Backend Optimization
- Use connection pooling for database
- Implement Redis for caching
- Enable compression middleware
- Use clustering with PM2

### Database Optimization
- Add proper indexes
- Optimize queries
- Regular maintenance
- Monitor slow queries

## Troubleshooting

### Common Issues

#### Application Won't Start
1. Check PM2 logs: `pm2 logs`
2. Verify environment variables
3. Check database connection
4. Ensure all dependencies installed

#### Database Connection Issues
1. Verify MySQL is running: `sudo systemctl status mysql`
2. Check database credentials
3. Test connection manually
4. Check firewall settings

#### File Upload Issues
1. Check upload directory permissions
2. Verify disk space
3. Check file size limits
4. Review Nginx configuration

## Rollback Strategy

### Quick Rollback
```bash
# Stop current application
pm2 stop car-rental-backend

# Restore from backup
git checkout previous-stable-tag
npm install --production
pm2 start ecosystem.config.js --env production
```

### Database Rollback
```bash
# Restore database from backup
mysql -u car_rental_user -p car_rental_prod < backup_file.sql
```

This deployment guide provides comprehensive instructions for deploying the Car Rental Booking System in various production environments. Choose the option that best fits your infrastructure and requirements.