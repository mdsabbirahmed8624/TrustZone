# 📖 Enterprise System Operations Manual
## TrustZone Mobile Care ERP — Version 11.0.0

This manual defines the routine maintenance cadence, system operation guidelines, database administration, log management, and security audits required for ongoing operational health of **TrustZone Mobile Care ERP**.

---

## 1. Operations Maintenance Cadence

### 1.1 Daily Maintenance Tasks (Every 24 Hours)
- [ ] **Health Check Verification**: Monitor `/api/v1/health` status and HTTP status dashboard.
- [ ] **Log Inspection**: Inspect error logs for uncaught exceptions (`pm2 logs --err` or CloudWatch/Datadog logs).
- [ ] **Backup Verification**: Verify automated 02:00 UTC database backup completed successfully and check archive size.
- [ ] **Queue Monitoring**: Verify pending job count in `BackgroundJob` table is zero or processing normally.
- [ ] **Disk Usage Check**: Verify root `/` and `/var/lib/postgresql` disk utilization is under 80%.

### 1.2 Weekly Maintenance Tasks (Every 7 Days)
- [ ] **Database Vacuuming**: Execute `VACUUM ANALYZE;` on PostgreSQL to clean dead tuples and refresh statistics.
- [ ] **Redis Health & Memory**: Check Redis memory fragmentation ratio (`redis-cli info memory`).
- [ ] **SSL Certificate Validation**: Verify TLS/SSL certificate expiration date (`certbot certificates`).
- [ ] **User Access Review**: Audit locked out accounts and security event logs (`LoginAudit`, `SecurityEvent`).

### 1.3 Monthly Maintenance Tasks (Every 30 Days)
- [ ] **Security Patch Management**: Apply OS kernel and package security updates (`sudo apt update && sudo apt upgrade -y`).
- [ ] **Dependency Audit**: Run `npm audit` to check for security advisories in Node modules.
- [ ] **Database Reindex**: Run `REINDEX DATABASE trustzone_db;` during scheduled low-traffic maintenance window.
- [ ] **Disaster Recovery Drill**: Perform test database restoration from backup archive to a sandbox environment.

---

## 2. Database & Storage Administration

### 2.1 Storage Purging & Retention Rules
- **Document Retention Engine**: Managed via `DocumentRetention` model (Book 3). Legal retention schedules automatically enforce archival.
- **Log Retention**: Audit trails (`AuditLog`, `ActivityLog`) are retained for 365 days before cold storage compression.
- **Temporary Uploads**: `/uploads/temp` contents purged daily via cron task.

### 2.2 Log Rotation Configuration (`logrotate`)
Configure `/etc/logrotate.d/trustzone-erp`:
```
/var/log/trustzone/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

---

## 3. Performance & Resource Benchmarking

| Metric | Target Threshold | Action Required If Exceeded |
|:---|:---|:---|
| **API Latency (p95)** | `< 150ms` | Analyze PostgreSQL query plans (`EXPLAIN ANALYZE`), check Redis hit ratio. |
| **CPU Utilization** | `< 70% avg` | Scale application instances horizontally or increase vCPU. |
| **Memory Utilization** | `< 80%` | Investigate memory leaks in Node.js runtime (`pm2 reload`). |
| **Database Connections** | `< 80% of max_connections` | Adjust Prisma connection pool limit or enable PgBouncer. |
| **Disk Space Usage** | `< 80%` | Prune old backup files, compress logs, expand storage volume. |
