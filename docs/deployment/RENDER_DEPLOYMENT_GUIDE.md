# ☁️ Render.com Production Deployment Guide
## TrustZone Mobile Care ERP — Version 11.0.0

This document provides complete instructions for deploying the **TrustZone Mobile Care ERP** on **Render.com** using Render Web Services, Managed PostgreSQL database, and Redis Instance.

---

## 1. Architecture on Render

```
  +------------------+     +-------------------+     +------------------+
  |  Render Postgres |     |    Render Redis   |     | Render Web Svc   |
  |  PostgreSQL 15   | <-> |    Redis 7        | <-> |  Node.js NestJS  |
  | (Internal Conn)  |     | (Internal Conn)   |     |   (Port 4000)    |
  +------------------+     +-------------------+     +--------+---------+
                                                              |
                                                    https://api.trustzone.care
```

---

## 2. Step-by-Step Deployment Instructions

### Step 1: Create a PostgreSQL Database on Render
1. Log into your Render Dashboard (`https://dashboard.render.com`).
2. Click **New +** -> **PostgreSQL**.
3. Configure settings:
   - **Name**: `trustzone-postgres`
   - **Database**: `trustzone_db`
   - **User**: `postgres`
   - **Region**: Oregon (US West) or closest region
   - **PostgreSQL Version**: `15`
   - **Plan**: Standard / Pro
4. Click **Create Database**.
5. Once provisioned, copy the **Internal Database URL** (e.g. `postgresql://postgres:password@dpg-xxx-a:5432/trustzone_db`).

---

### Step 2: Create a Redis Instance on Render
1. Click **New +** -> **Redis**.
2. Configure settings:
   - **Name**: `trustzone-redis`
   - **Region**: Same region as PostgreSQL
   - **Plan**: Starter / Standard
3. Click **Create Redis**.
4. Copy the **Internal Redis URL** or host details:
   - `REDIS_HOST`: `red-xxx-a`
   - `REDIS_PORT`: `6379`

---

### Step 3: Create Web Service for NestJS Backend
1. Click **New +** -> **Web Service**.
2. Connect your GitHub repository `mdsabbirahmed8624/trustzone-mobile-care`.
3. Select branch: `phase-11-final-audit` (or `main`).
4. Configure Web Service settings:
   - **Name**: `trustzone-erp-backend`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm ci && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```bash
     npm run start:prod
     ```
   - **Instance Type**: Standard / Pro (2 GB RAM minimum recommended)

---

### Step 4: Environment Variables Setup on Render
In the Web Service configuration, navigate to **Environment** tab and add:

```env
PORT=4000
NODE_ENV=production
DATABASE_URL=postgresql://postgres:PASSWORD@dpg-xxx-a:5432/trustzone_db
REDIS_HOST=red-xxx-a
REDIS_PORT=6379
JWT_SECRET_KEY=enter_64_char_secure_hex_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET_KEY=enter_64_char_secure_refresh_key_here
JWT_REFRESH_EXPIRES_IN=7d
STRIPE_API_KEY=sk_live_example
STRIPE_WEBHOOK_SECRET=whsec_example
TWILIO_ACCOUNT_SID=ACexample
TWILIO_AUTH_TOKEN=example_token
TWILIO_PHONE_NUMBER=+18005550199
SENDGRID_API_KEY=SG.example
SENDGRID_FROM_EMAIL=noreply@trustzone.care
```

---

### Step 5: Health Check Configuration
1. Scroll to **Advanced** settings in your Web Service configuration.
2. Set **Health Check Path**:
   ```
   /api/v1/health
   ```
3. Save changes. Render will monitor this path during deployment to ensure zero-downtime cutover.

---

### Step 6: Custom Domain & Free TLS SSL Setup
1. Go to **Settings** -> **Custom Domains**.
2. Click **Add Custom Domain** (e.g. `api.trustzone.care`).
3. Add CNAME record at your DNS host:
   - **Host**: `api`
   - **Target**: `trustzone-erp-backend.onrender.com`
4. Render automatically issues and renews SSL certificates.

---

## 3. Render Infrastructure Operations

### Automatic & Manual Scaling
- **Autoscaling**: In **Settings** -> **Autoscaling**, enable auto-scale between 1 and 5 instances based on CPU (>70%) or Memory (>80%) utilization.
- **Manual Scaling**: Adjust instance count slider.

### Rollback Strategy
1. Go to **Events** or **Deploys** tab in Render Dashboard.
2. Select a previous successful deployment.
3. Click **Rollback** button.

### Logs & Telemetry
- View live output under **Logs** tab in Render Dashboard.
- Export logs using Render Log Streams to Datadog / Logtail / Papertrail if required.

---

## 4. Render Troubleshooting Checklist

| Symptom | Cause | Resolution |
|:---|:---|:---|
| **Deploy Failed at `prisma generate`** | Missing OpenSSL in environment | Render Node runtime includes OpenSSL by default. Verify `package-lock.json` lockfile is committed. |
| **Database Migration Fails** | Schema drift or connection timeout | Verify `DATABASE_URL` is using Internal DB URL, not External URL. |
| **Web Service Failed Healthcheck** | App starting slowly | Increase Health Check initial delay or optimize NestJS bootstrap dependencies. |
