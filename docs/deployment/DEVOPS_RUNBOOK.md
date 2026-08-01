# 🛠️ Enterprise DevOps Runbook & Standard Operating Procedures (SOP)
## TrustZone Mobile Care ERP — Version 11.0.0

This runbook establishes Standard Operating Procedures (SOP) for site reliability engineering (SRE), operations, system maintenance, incident response, and emergency recovery for **TrustZone Mobile Care ERP**.

---

## 1. Standard Production Deployment Procedure

```
[ Git Push / Tag ] -> [ CI Verification Gate ] -> [ DB Migration Run ] -> [ Zero-Downtime Reload ] -> [ Smoke Test ]
```

### Pre-Deployment Verification
1. Verify CI build pipeline status on target git release tag (`v11.0.0`).
2. Run baseline health check:
   ```bash
   curl -I https://api.trustzone.care/api/v1/health
   ```
3. Take manual pre-deployment database snapshot:
   ```bash
   pg_dump -U trustzone_admin trustzone_db | gzip > /var/backups/postgres/pre_deploy_v11.sql.gz
   ```

### Execution Steps
```bash
cd /var/www/trustzone-erp
git fetch --all
git checkout phase-11-final-audit
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 reload trustzone-backend --update-env
```

### Post-Deployment Verification
```bash
curl https://api.trustzone.care/api/v1/health
pm2 status
```

---

## 2. Emergency Rollback Procedure

If critical errors, DB deadlocks, or service degradation occurs post-deployment:

### Immediate Application Rollback
```bash
cd /var/www/trustzone-erp
git checkout HEAD~1
npm ci
npx prisma generate
npm run build
pm2 reload trustzone-backend
```

### Database Rollback Procedure (If Schema Migration Caused Issue)
```bash
# Restore pre-deployment database dump
gunzip -c /var/backups/postgres/pre_deploy_v11.sql.gz | psql -U trustzone_admin trustzone_db
```

---

## 3. Incident Response & Emergency Recovery Protocol

### Severity 1 (P1 - System Outage / Database Unavailable)
- **SLA**: Initial response `< 15 minutes`, resolution `< 1 hour`.
- **Trigger**: Healthcheck returns `503` or `/api/v1/health` is unreachable.
- **Workflow**:
  1. Check process status: `pm2 status` or `docker-compose ps`.
  2. Check PostgreSQL service: `sudo systemctl status postgresql`.
  3. Inspect logs: `pm2 logs trustzone-backend --err --lines 100`.
  4. If database crashed due to disk space, clear old logs/temp files and restart DB: `sudo systemctl restart postgresql`.
  5. Restart backend: `pm2 restart trustzone-backend`.

### Severity 2 (P2 - Partial Module Degraded / High Latency)
- **SLA**: Initial response `< 30 minutes`, resolution `< 4 hours`.
- **Trigger**: Specific module endpoints returning 5xx or API latency exceeding `1000ms`.
- **Workflow**:
  1. Check Redis memory usage: `redis-cli info memory`.
  2. Flush Redis cache if cache key corruption suspected: `redis-cli flushdb`.
  3. Inspect PostgreSQL active queries:
     ```sql
     SELECT pid, query, age(clock_timestamp(), query_start) 
     FROM pg_stat_activity 
     WHERE state != 'idle' ORDER BY age DESC;
     ```
  4. Terminate hanging database queries if necessary: `SELECT pg_cancel_backend(PID);`.

---

## 4. Cache & Queue Reset Operational Procedures

### Clearing Redis Application Cache
```bash
# Connect to Redis container / local server
redis-cli -h localhost -p 6379

# Select database and flush
SELECT 0
FLUSHDB
```

### Re-queuing Stuck Background Jobs
1. Background jobs are logged in `BackgroundJob` & `JobQueue` Prisma tables.
2. Query stuck jobs:
   ```sql
   UPDATE "BackgroundJob" SET status = 'PENDING', "retryCount" = 0 WHERE status = 'FAILED';
   ```

---

## 5. Log Collection & System Diagnostics Diagnostics Script

Run this diagnostic command to collect full system state for analysis:

```bash
#!/bin/bash
echo "=== SYSTEM HEALTH AUDIT ==="
date
echo "--- Uptime ---"
uptime
echo "--- Memory Usage ---"
free -h
echo "--- Disk Space ---"
df -h /
echo "--- PM2 Status ---"
pm2 status
echo "--- Nginx Status ---"
sudo systemctl status nginx --no-pager
echo "--- Postgres Status ---"
sudo systemctl status postgresql --no-pager
echo "--- Redis Status ---"
redis-cli ping
```
