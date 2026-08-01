# 📋 Production Deployment Manifest
## TrustZone Mobile Care ERP — Version 11.0.0

> **Release Status**: GA (Generally Available)  
> **Documentation Version**: 11.0.0  
> **Target Environment**: Production Cluster  

---

## 1. System Metadata & Release Information

| Parameter | Value | Reference / Source |
|:---|:---|:---|
| **Project Name** | TrustZone Mobile Care ERP | `package.json` |
| **System Version** | `11.0.0` | Enterprise Release 11 (Phase 11 / Book 10 Complete) |
| **Release Tag** | `v11.0.0` | Git Release Tag |
| **Active Git Branch** | `phase-11-final-audit` | Verified Audit Branch |
| **Repository URL** | `https://github.com/mdsabbirahmed8624/trustzone-mobile-care.git` | Remote Origin |
| **License** | UNLICENSED (Proprietary Enterprise) | `package.json` |

---

## 2. Runtime & Core Technologies Stack

### 2.1 Server Core Runtime
- **Node.js Engine**: `20.x` LTS (`node:20-alpine` base image in `Dockerfile`)
- **NPM Package Manager**: `10.x` (`package-lock.json` lockfile v3)
- **TypeScript Core**: `^5.4.5` (`tsconfig.json` target ES2021)

### 2.2 Application Frameworks
- **Backend Framework**: NestJS `^10.3.9` (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`)
- **Frontend Framework**: Next.js `16.2.10` (`/frontend` directory, React `19.2.4`, Tailwind CSS `^4`)
- **Real-Time WebSockets**: Socket.io / NestJS WebSockets `^10.3.9` (`@nestjs/platform-socket.io`)

---

## 3. Data Tier & Storage Infrastructure

### 3.1 Primary Relational Database
- **Database Engine**: PostgreSQL `15-alpine` (`docker-compose.yml`)
- **ORM / Schema Engine**: Prisma ORM `^5.15.0` (`@prisma/client`, `prisma/schema.prisma`)
- **Schema Scale**: 220+ Data Models across 33 Domain Modules
- **Connection Protocol**: PostgreSQL Wire Protocol with Connection Pooling

### 3.2 In-Memory Cache & Key-Value Store
- **Cache Store**: Redis `7-alpine` (`docker-compose.yml`)
- **Redis Driver**: `ioredis ^5.4.1` with `cache-manager-redis-yet ^5.0.1` & `@nestjs/cache-manager ^2.2.2`
- **Use Cases**: Session Caching, Rate-Limit Throttling, Offline Sync Locks, Realtime Token Verification

### 3.3 File & Blob Storage
- **Local Storage Provider**: File System Storage (`/uploads`, `/exports`)
- **Cloud Object Storage Adapter**: Cloudinary API (`CLOUDINARY_URL` env adapter ready)

---

## 4. Middleware, Security & Gateway Components

### 4.1 Authentication & Authorization Security
- **Hashing Algorithms**: Argon2 `^0.44.0` / bcrypt `^5.1.1`
- **Session Tokens**: JSON Web Tokens (`jsonwebtoken ^9.0.2`)
- **Access Control**: Role-Based Access Control (RBAC) via `PermissionsGuard` & `JwtAuthGuard`
- **Security Headers**: Helmet `^7.1.0` HTTP Header Protection

### 4.2 API Gateway & Communications
- **API Protocol**: RESTful API (`/api/v1/*`) + WebSockets (`/realtime`)
- **API Documentation**: OpenAPI 3.0 via Swagger UI `^5.0.1` (`@nestjs/swagger ^7.4.2`)
- **Rate Limiting**: Throttler Guard (`@nestjs/throttler ^5.1.2`, default 60 req / min)

### 4.3 Notification & Messaging Services
- **Transactional Email**: SendGrid API (`SENDGRID_API_KEY`)
- **SMS Gateway**: Twilio Messaging API (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`)

### 4.4 Background Jobs & Logging
- **Cron Scheduler**: `@nestjs/schedule` with `cron-parser ^5.6.2`
- **Job Queues**: Prisma-backed `JobQueue` / `BackgroundJob` & Redis Queue adapters
- **Logging Engine**: Winston Logger `^3.13.0` & NestJS System Logger

---

## 5. Deployment Topology Summary

```
                      +-----------------------------+
                      |   Client Tier (Web/Mobile)  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |      Nginx Reverse Proxy    |
                      |   SSL/TLS (Certbot/HTTPS)   |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |    TrustZone ERP Backend    |
                      |  NestJS 10.3 (Port 4000)    |
                      +-------+--------------+------+
                              |              |
                              v              v
               +--------------------+  +-------------------+
               | PostgreSQL 15 DB   |  |   Redis 7 Cache   |
               |  (Port 5432)       |  |   (Port 6379)     |
               +--------------------+  +-------------------+
```

---

## 6. Verification Status

- **Prisma Schema**: Verified Valid (`prisma validate`)
- **Compilation**: Clean Build (`npx nest build`)
- **Code Audit**: Clean (`npx eslint src`)
- **Test Suite**: 30 Test Suites Passed (177 Unit Tests)
- **Deployment Status**: GA Certified for Enterprise Production
