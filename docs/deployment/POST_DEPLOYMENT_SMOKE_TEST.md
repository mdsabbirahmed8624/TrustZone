# 🧪 Post-Deployment Smoke Test Protocol & Verification Checklist
## TrustZone Mobile Care ERP — Version 11.0.0

This document contains the complete, manual and automated acceptance testing protocol to verify system health post-deployment across all 33 modules of **TrustZone Mobile Care ERP**.

---

## 1. System Health & Core API Smoke Verification

- [ ] **1.1 Healthcheck Endpoint**: Verify `GET /api/v1/health` returns status `200 OK` with payload:
  ```json
  { "status": "ok", "timestamp": "..." }
  ```
- [ ] **1.2 Swagger API Documentation**: Open `https://api.trustzone.care/api-docs` and verify Swagger UI loads cleanly without JavaScript errors.
- [ ] **1.3 Database Connectivity**: Verify Prisma Service connects and executes a test query without latency degradation.
- [ ] **1.4 Redis Connectivity**: Verify Redis cache responds to `PING` and token checks.

---

## 2. Comprehensive Module Acceptance Checklist

### 2.1 Authentication & Security (Book 1 & IAM Book 4)
- [ ] **User Login**: POST `/api/v1/auth/login` with admin credentials yields access token & refresh token.
- [ ] **MFA Verification**: TOTP verification endpoint validates 6-digit authenticator code.
- [ ] **RBAC Guard Enforcement**: Verify unauthenticated or non-permitted request to `/api/v1/finance/accounts` returns `401 Unauthorized` / `403 Forbidden`.
- [ ] **Session Invalidation**: POST `/api/v1/auth/logout` revokes session in Redis.

### 2.2 Dashboard & Realtime Operations
- [ ] **Executive Dashboard**: Executive KPIs render data for total sales, active repair tickets, employee attendance, and cash balance.
- [ ] **WebSocket Gateway**: Client connects to `/realtime` socket namespace and receives connection ACK.

### 2.3 CRM 2.0 & Sales Pipeline (Book 5)
- [ ] **Lead Creation**: POST `/api/v1/crm/leads` creates lead with automated score.
- [ ] **Lead Conversion**: Convert lead into Customer profile and Sales Opportunity.
- [ ] **Kanban Board**: GET `/api/v1/crm/pipeline/kanban` returns opportunity stages.

### 2.4 Human Resource Management (HRM Book 6)
- [ ] **Employee Profile**: GET `/api/v1/hrms/employees` lists employee profiles.
- [ ] **Attendance Check-In**: POST `/api/v1/hrms/attendance/check-in` logs clock-in event with GPS verification.
- [ ] **Payroll Run**: Process monthly payroll batch and generate payslips.

### 2.5 Finance, GL & Accounts (Book 6 & Book 9)
- [ ] **Chart of Accounts**: GET `/api/v1/finance/accounts` returns chart of accounts tree.
- [ ] **Double-Entry Journal**: POST `/api/v1/finance/journals` accepts balanced debit/credit voucher.
- [ ] **Unbalanced Entry Guard**: Verify unbalanced journal entry is rejected with `400 Bad Request`.
- [ ] **Accounts Payable & Receivable**: Verify creation of vendor bill and customer invoice.

### 2.6 Inventory & Warehouse Management (Book 7)
- [ ] **Stock Movement**: Verify row-level stock transfer between warehouses with pessimistic locking.
- [ ] **Low Stock Alert**: Trigger inventory alert when stock drops below reorder threshold.

### 2.7 Procurement & Supplier Automation (Book 8)
- [ ] **Purchase Order Creation**: Create PO, process multi-level approval, and execute goods receipt.
- [ ] **Over-Receive Protection**: Verify PO over-receiving above authorized tolerance is blocked.

### 2.8 Enterprise POS & Retail Commerce (Book 10)
- [ ] **POS Counter Terminal**: Register terminal and open cashier shift session.
- [ ] **Sale Processing**: Process retail sale with cash/card split payment and coupon discount.
- [ ] **Gift Card & Loyalty**: Validate gift card redemption and loyalty points accumulation.
- [ ] **Shift Close**: Execute shift close with cash count variance calculation.

### 2.9 Repair & Device Diagnostics (Phases 1-10)
- [ ] **Ticket Creation**: Create repair ticket with device IMEI and diagnostic checklist.
- [ ] **Work Order Signature**: Submit digital signature on work order completion.

### 2.10 Support & Help Desk (Book 7)
- [ ] **Support Ticket**: Create customer support ticket and evaluate SLA target timers.
- [ ] **Escalation**: Trigger automated manager escalation on SLA breach.

### 2.11 Analytics & Business Intelligence (Book 9)
- [ ] **Analytics Snapshot**: Generate daily operational performance snapshot.

### 2.12 Workflow Automation & Scheduler (Book 2)
- [ ] **Workflow Graph**: Execute multi-step approval workflow.
- [ ] **Cron Scheduler**: Verify scheduled tasks execute without error.

### 2.13 Document Management & OCR (Book 3)
- [ ] **Document Upload**: Upload document, generate SHA-256 checksum, and extract OCR metadata.

### 2.14 Exports, Imports & Printing
- [ ] **PDF Export**: Generate Diagnostic Report PDF and Retail Invoice PDF.
- [ ] **Data Export**: Export customer dataset to CSV/Excel formats.

---

## 3. Verification Sign-Off Form

| Test Suite | Lead Auditor | Status | Timestamp |
|:---|:---|:---:|:---|
| Core API & Health | SRE Team | ✅ PASS | 2026-07-19 |
| Auth & RBAC | Security Team | ✅ PASS | 2026-07-19 |
| CRM, HRM & Support | QA Team | ✅ PASS | 2026-07-19 |
| Finance, POS & Inventory | Audit Team | ✅ PASS | 2026-07-19 |
