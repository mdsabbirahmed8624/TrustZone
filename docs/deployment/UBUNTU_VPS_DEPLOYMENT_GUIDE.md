# 🐧 Ubuntu VPS Production Deployment Guide
## TrustZone Mobile Care ERP — Version 11.0.0

This runbook provides end-to-end instructions for deploying **TrustZone Mobile Care ERP** on an **Ubuntu 22.04 LTS / 24.04 LTS** virtual private server (DigitalOcean, AWS EC2, Linode, Hetzner, Vultr).

---

## 1. System Preparation & Firewall Configuration

### Step 1: Update Operating System & Utilities
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential ufw ufw-extras software-properties-common ca-certificates gnupg
```

### Step 2: Configure UFW Firewall Security
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw enable
sudo ufw status verbose
```

---

## 2. Installation of Core Dependencies

### Step 3: Install Node.js 20 LTS Engine & Global Utilities
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
node -v # Expected: v20.x.x
npm -v  # Expected: v10.x.x
```

### Step 4: Install & Configure PostgreSQL 15 Engine
```bash
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL systemd service
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create Production Database & Service User
sudo -u postgres psql -c "CREATE USER trustzone_admin WITH PASSWORD 'SecureDbPassword2026!';"
sudo -u postgres psql -c "CREATE DATABASE trustzone_db OWNER trustzone_admin;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE trustzone_db TO trustzone_admin;"
```

### Step 5: Install & Configure Redis 7 Server
```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Verify Redis operational status
redis-cli ping # Expected: PONG
```

---

## 3. Application Deployment & Build

### Step 6: Clone Repository & Install Node Modules
```bash
sudo mkdir -p /var/www/trustzone-erp
sudo chown -R $USER:$USER /var/www/trustzone-erp
cd /var/www/trustzone-erp

git clone https://github.com/mdsabbirahmed8624/trustzone-mobile-care.git .
git checkout phase-11-final-audit

npm ci
```

### Step 7: Environment File Setup
Create `/var/www/trustzone-erp/.env`:
```env
PORT=4000
NODE_ENV=production

DATABASE_URL="postgresql://trustzone_admin:SecureDbPassword2026!@localhost:5432/trustzone_db?schema=public"

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET_KEY="production-secure-jwt-secret-key-replace-with-64-char-string"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET_KEY="production-secure-refresh-jwt-secret-key-replace-with-64-char-string"
JWT_REFRESH_EXPIRES_IN="7d"

SENDGRID_API_KEY="SG.production_key"
SENDGRID_FROM_EMAIL="noreply@trustzone.care"
```

### Step 8: Execute Database Migrations & Build
```bash
npx prisma generate
npx prisma migrate deploy
npm run build
```

---

## 4. PM2 Process Management & Systemd Service

### Step 9: Configure PM2 (`ecosystem.config.js`)
Create `/var/www/trustzone-erp/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'trustzone-backend',
      script: 'dist/src/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    }
  ]
};
```

### Step 10: Launch Backend Process under PM2
```bash
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER
```

---

## 5. Nginx Reverse Proxy & SSL TLS Certificate Setup

### Step 11: Install Nginx & Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Step 12: Configure Nginx Virtual Host
Create `/etc/nginx/sites-available/trustzone-erp`:
```nginx
server {
    listen 80;
    server_name api.trustzone.care;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /realtime {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable virtual host and test Nginx syntax:
```bash
sudo ln -s /etc/nginx/sites-available/trustzone-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 13: Provision Let's Encrypt TLS SSL Certificate
```bash
sudo certbot --nginx -d api.trustzone.care --non-interactive --agree-tos -m admin@trustzone.care
```

---

## 6. Automated Backup Script & Log Rotation Setup

### Step 14: Configure Daily PostgreSQL Automated Backup
Create `/var/www/trustzone-erp/scripts/db_backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U trustzone_admin -h localhost trustzone_db | gzip > $BACKUP_DIR/trustzone_db_$DATE.sql.gz
find $BACKUP_DIR -type f -mtime +7 -name "*.sql.gz" -delete
```
Set permissions and add to crontab:
```bash
chmod +x /var/www/trustzone-erp/scripts/db_backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/trustzone-erp/scripts/db_backup.sh") | crontab -
```

---

## 7. Zero-Downtime Update Procedure

```bash
cd /var/www/trustzone-erp
git pull origin phase-11-final-audit
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 reload trustzone-backend
```
