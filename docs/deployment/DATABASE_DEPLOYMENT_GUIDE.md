# 🗄️ Database Deployment & Prisma Architecture Guide
## TrustZone Mobile Care ERP — Version 11.0.0

This guide details the relational database deployment, Prisma ORM configuration, schema migration policies, seeding strategies, backup workflows, and index performance tuning for **TrustZone Mobile Care ERP**.

---

## 1. Schema Overview & Data Tier Scale

- **Database Engine**: PostgreSQL 15+
- **ORM**: Prisma ORM `^5.15.0` (`@prisma/client`)
- **Schema Scale**: 220+ Data Models across 33 enterprise modules
- **Primary Schema File**: `prisma/schema.prisma` (4,800+ lines)
- **Key Schema Architectural Features**:
  - UUID Primary Keys (`@id @default(uuid()) @db.Uuid`) across all entities.
  - Foreign Key constraints with explicit referential actions (`onDelete: Cascade` / `onDelete: Restrict`).
  - Table mapping annotations (`@@map("table_names")`).
  - Soft delete columns (`isDeleted Boolean @default(false)`, `deletedAt DateTime?`).
  - Standard timestamp audit metadata (`createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`).

---

## 2. Migration Strategy (`prisma migrate deploy`)

In production environments, interactive migration generation (`prisma migrate dev`) **must never be run**. Production deployment uses immutable migration scripts.

### 2.1 Production Migration Command
```bash
npx prisma migrate deploy
```
This command checks the `prisma/migrations/` directory against the `_prisma_migrations` system table in PostgreSQL and applies any pending migrations atomically inside transactions.

### 2.2 Pre-Migration Verification
Before applying migrations on production:
```bash
# Check status of applied vs pending migrations
npx prisma migrate status
```

---

## 3. Seeding Strategy

Default system roles, system configuration parameters, default tax codes, permission groups, and initial administrator profiles are seeded via Prisma seed scripts.

### Execution Command
```bash
npx prisma db seed
```

---

## 4. Connection Pooling & Performance Configuration

### 4.1 Connection Pool Sizing
Prisma Client manages an internal connection pool. The pool size is configured via the `DATABASE_URL` query parameter:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/trustzone_db?schema=public&connection_limit=20&pool_timeout=10"
```

- **`connection_limit` Formula**: `(Num Physical CPU Cores * 2) + 4`. For a 4 vCPU server, set `connection_limit=12`.
- **`pool_timeout`**: Set to `10` seconds to prevent request thread starvation.

---

## 5. Index & Query Performance Tuning

### Critical Indexes in Schema
The Prisma schema defines composite and single-column indexes on high-throughput query paths:

- **Users & Auth**: `@unique` on `User.email`, `User.username`, index on `User.roleId`.
- **Tickets**: Indexes on `Ticket.customerId`, `Ticket.technicianId`, `Ticket.status`.
- **Inventory & POS**: Indexes on `BranchInventory.partId`, `POSShift.userId`, `Sale.counterId`.
- **Journal Accounting**: Indexes on `JournalEntry.periodId`, `JournalLine.accountCode`.

### Recommended PostgreSQL Maintenance (`VACUUM` & `ANALYZE`)
To prevent table bloat and ensure query planner optimization:
```sql
-- Weekly database maintenance query
VACUUM ANALYZE;
```
