# 🚂 Railway.app Production Deployment Guide
## TrustZone Mobile Care ERP — Version 11.0.0

This step-by-step guide details the complete deployment process for hosting **TrustZone Mobile Care ERP** on **Railway.app** platform using managed PostgreSQL, Redis, and Web Services.

---

## 1. Prerequisites
- A Railway.app account with an active Subscription / Developer plan.
- GitHub account with admin access to `mdsabbirahmed8624/trustzone-mobile-care`.
- Railway CLI installed locally (optional, for CLI deployments):
  ```bash
  npm i -g @railway/cli
  ```

---

## 2. Step-by-Step Railway Deployment Workflow

### Step 1: Create a New Project
1. Log into your **Railway Dashboard** (`https://railway.app/dashboard`).
2. Click **+ New Project**.
3. Select **Deploy from GitHub repo**.
4. Authorize Railway to access `mdsabbirahmed8624/trustzone-mobile-care`.
5. Select the repository and set the deployment branch to `phase-11-final-audit` (or `main`).

---

### Step 2: Provision PostgreSQL Database Infrastructure
1. In your Railway project canvas, click **+ New** -> **Database** -> **Add PostgreSQL**.
2. Railway will automatically provision a PostgreSQL 15 instance.
3. Click on the PostgreSQL service card, navigate to the **Variables** tab, and copy the internal connection variable:
   - `${{Postgres.DATABASE_URL}}`

---

### Step 3: Provision Redis In-Memory Cache Service
1. Click **+ New** -> **Database** -> **Add Redis**.
2. Railway will provision a Redis 7 instance.
3. Note the internal variables generated:
   - `REDIS_HOST`: `${{Redis.REDISHOST}}`
   - `REDIS_PORT`: `${{Redis.REDISPORT}}`
   - `REDIS_PASSWORD`: `${{Redis.REDISPASSWORD}}`

---

### Step 4: Configure Web Service Environment Variables
1. Select the **Backend Web Service** card.
2. Navigate to **Variables** -> **Raw Editor** or add them individually:

```env
PORT=4000
NODE_ENV=production

# Database (Reference Railway Postgres Service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis Cache (Reference Railway Redis Service)
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}

# Authentication Secrets (Generate 64-character random hex strings)
JWT_SECRET_KEY=e83a9f14b2d56c7890123456789abcdef0123456789abcdef0123456789abcdef
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET_KEY=9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba
JWT_REFRESH_EXPIRES_IN=7d

# Integration Secrets (Optional / Add as required)
STRIPE_API_KEY=sk_live_example
STRIPE_WEBHOOK_SECRET=whsec_example
TWILIO_ACCOUNT_SID=ACexample
TWILIO_AUTH_TOKEN=example_token
TWILIO_PHONE_NUMBER=+18005550199
SENDGRID_API_KEY=SG.example
SENDGRID_FROM_EMAIL=noreply@trustzone.care
```

---

### Step 5: Build & Start Command Configuration
1. Navigate to the **Settings** tab of your Backend Service.
2. Set the **Build Command**:
   ```bash
   npx prisma generate && npm run build
   ```
3. Set the **Start Command**:
   ```bash
   npm run start:prod
   ```
   > **Note**: `npm run start:prod` executes `npx prisma migrate deploy && node dist/src/main` automatically, ensuring migrations run before app launch.

---

### Step 6: Configure Health Check Path
1. In **Settings** -> **Healthcheck Path**, enter:
   ```
   /api/v1/health
   ```
2. Set **Healthcheck Timeout** to `10 seconds`.

---

### Step 7: Custom Domain Setup & TLS SSL
1. Go to **Settings** -> **Networking** -> **Custom Domains**.
2. Click **+ Custom Domain**.
3. Enter your domain (e.g., `api.trustzone.care`).
4. Railway will provide a CNAME target (e.g., `trustzone-backend.up.railway.app`).
5. Go to your DNS provider (Cloudflare / Namecheap / GoDaddy) and create a CNAME record:
   - **Type**: `CNAME`
   - **Name**: `api`
   - **Target**: `trustzone-backend.up.railway.app`
   - **TTL**: Auto / 300
6. Railway provisions TLS/SSL certificates automatically via Let's Encrypt.

---

## 3. Operations & Maintenance on Railway

### Horizontal & Vertical Scaling
- **Vertical Scaling**: Under **Settings** -> **Resource Allocation**, adjust vCPU (e.g. 1 vCPU to 8 vCPU) and RAM (512MB to 8GB).
- **Horizontal Scaling**: Increase replica count in Railway project settings.

### Re-triggering Deployments & Restarts
- **Restart Service**: Click **Restart** button on the top right of the backend service card.
- **Redeploy**: Go to **Deployments** tab -> click **Redeploy** on the target commit.

### Viewing Production Logs
- Click on your Backend Service -> **Logs** tab.
- Filter by `Deploy Logs` or `Application Logs`.
- Search for standard NestJS bootstrap log:
  ```
  [Nest] NestApplication - Application initialized successfully
  [Nest] NestApplication - Listening on port 4000
  ```

### Rollback Strategy
1. Go to **Deployments** tab.
2. Locate the last known good deployment.
3. Click the three dots `...` next to the commit.
4. Select **Rollback to this deployment**.

---

## 4. Railway Troubleshooting Guide

| Issue | Root Cause | Resolution |
|:---|:---|:---|
| **Build Error: `Cannot find module '@prisma/client'`** | Prisma Client not generated before build | Ensure build command includes `npx prisma generate && npm run build`. |
| **App Crash: `P1001: Cannot connect to DB`** | `DATABASE_URL` reference variable invalid or DB not healthy | Verify Railway Postgres container status and check env variable binding `${{Postgres.DATABASE_URL}}`. |
| **Health Check Timeout** | `/api/v1/health` endpoint returning non-200 | Verify database & Redis connections are established. Test locally using `curl http://localhost:4000/api/v1/health`. |
| **Out of Memory (OOM) Crash** | Node.js memory limit reached during build | Increase build RAM allocation to at least 2GB in Railway service settings. |
