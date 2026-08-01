# 📦 Dependency Inventory & Security Audit
## TrustZone Mobile Care ERP — Version 11.0.0

This inventory details all production and development dependencies declared in `package.json`, analyzing package versions, functional roles, criticality levels, deprecation status, and upgrade recommendations.

---

## 1. Production Dependencies (`dependencies`)

| Package Name | Version | Functional Purpose in ERP | Category | Criticality | Recommendation | Deprecated | Security Notes |
|:---|:---|:---|:---|:---:|:---|:---:|:---|
| `@nestjs/cache-manager` | `^2.2.2` | NestJS wrapper for cache manager | Caching | **HIGH** | Maintain Current | No | Secure |
| `@nestjs/common` | `^10.3.9` | Core NestJS framework decorators & utilities | Framework | **CRITICAL** | Maintain `10.x` LTS | No | Secure |
| `@nestjs/config` | `^3.2.2` | Environment configuration management (`ConfigModule`) | Config | **CRITICAL** | Maintain Current | No | Secure |
| `@nestjs/core` | `^10.3.9` | Core NestJS application engine | Framework | **CRITICAL** | Maintain `10.x` LTS | No | Secure |
| `@nestjs/platform-express` | `^10.3.9` | Express HTTP platform adapter | Web Server | **CRITICAL** | Maintain Current | No | Secure |
| `@nestjs/platform-socket.io` | `^10.3.9` | Real-time WebSocket gateway adapter | WebSockets | **HIGH** | Maintain Current | No | Secure |
| `@nestjs/swagger` | `^7.4.2` | OpenAPI 3.0 documentation generator | API Docs | **MEDIUM** | Maintain Current | No | Secure |
| `@nestjs/throttler` | `^5.1.2` | Rate limiting & anti-DoS guard | Security | **CRITICAL** | Maintain Current | No | Secure |
| `@nestjs/websockets` | `^10.3.9` | NestJS WebSocket core module | WebSockets | **HIGH** | Maintain Current | No | Secure |
| `@prisma/client` | `^5.15.0` | Auto-generated PostgreSQL ORM query client | Database | **CRITICAL** | Maintain `5.x` LTS | No | Secure |
| `argon2` | `^0.44.0` | Password hashing (Argon2id algorithm) | Auth | **CRITICAL** | Maintain Current | No | Secure |
| `bcrypt` | `^5.1.1` | Password hashing fallback algorithm | Auth | **CRITICAL** | Maintain Current | No | Secure |
| `cache-manager` | `^5.6.1` | Multi-store caching abstraction layer | Caching | **HIGH** | Maintain Current | No | Secure |
| `cache-manager-redis-yet` | `^5.0.1` | Redis store engine for cache-manager | Caching | **HIGH** | Maintain Current | No | Secure |
| `class-transformer` | `^0.5.1` | Serialization of plain objects to class instances | DTOs | **CRITICAL** | Maintain Current | No | Secure |
| `class-validator` | `^0.14.1` | Declarative DTO validation decorators | Security | **CRITICAL** | Maintain Current | No | Secure |
| `cron-parser` | `^5.6.2` | Evaluation of cron schedule expressions | Scheduler | **HIGH** | Maintain Current | No | Secure |
| `helmet` | `^7.1.0` | HTTP Security Headers middleware | Security | **CRITICAL** | Maintain Current | No | Secure |
| `ioredis` | `^5.4.1` | High-performance Redis client driver | Caching | **CRITICAL** | Maintain Current | No | Secure |
| `jsonwebtoken` | `^9.0.2` | JWT access & refresh token signing/verification | Auth | **CRITICAL** | Maintain Current | No | Secure |
| `prisma` | `^5.15.0` | Prisma CLI & schema migration engine | Database | **CRITICAL** | Maintain `5.x` LTS | No | Secure |
| `reflect-metadata` | `^0.2.2` | Polyfill for TypeScript experimental decorators | System | **CRITICAL** | Maintain Current | No | Secure |
| `rxjs` | `^7.8.1` | Reactive extensions library for async events | Reactive | **CRITICAL** | Maintain `7.x` | No | Secure |
| `swagger-ui-express` | `^5.0.1` | Interactive Swagger UI middleware | API Docs | **MEDIUM** | Maintain Current | No | Secure |
| `winston` | `^3.13.0` | Multi-transport logging library | Logging | **HIGH** | Maintain Current | No | Secure |

---

## 2. Development & Build Dependencies (`devDependencies`)

| Package Name | Version | Functional Purpose | Category | Criticality | Deprecated |
|:---|:---|:---|:---|:---:|:---:|
| `@nestjs/cli` | `^10.3.2` | NestJS Command Line Interface | Build Tool | **HIGH** | No |
| `@nestjs/schematics` | `^10.1.1` | Code scaffolding templates | Dev Utility | **LOW** | No |
| `@nestjs/testing` | `^10.3.9` | Testing utilities (`Test.createTestingModule`) | Testing | **CRITICAL** | No |
| `@types/bcrypt` | `^5.0.2` | TypeScript definitions for bcrypt | Types | **HIGH** | No |
| `@types/express` | `^4.17.21` | TypeScript definitions for Express | Types | **HIGH** | No |
| `@types/jest` | `^29.5.12` | TypeScript definitions for Jest | Types | **HIGH** | No |
| `@types/node` | `^20.14.2` | TypeScript definitions for Node.js 20 | Types | **CRITICAL** | No |
| `@typescript-eslint/eslint-plugin` | `^7.12.0` | ESLint rules for TypeScript | Code Quality | **HIGH** | No |
| `@typescript-eslint/parser` | `^7.12.0` | TypeScript parser for ESLint | Code Quality | **HIGH** | No |
| `eslint` | `^8.57.0` | Static code analysis engine | Code Quality | **CRITICAL** | No |
| `eslint-config-prettier` | `^9.1.0` | Disables ESLint rules that conflict with Prettier | Formatting | **MEDIUM** | No |
| `eslint-plugin-prettier` | `^5.1.3` | Runs Prettier as an ESLint rule | Formatting | **MEDIUM** | No |
| `jest` | `^29.7.0` | Test runner framework | Testing | **CRITICAL** | No |
| `prettier` | `^3.3.0` | Code formatter | Formatting | **MEDIUM** | No |
| `supertest` | `^7.0.0` | HTTP assertion library for E2E testing | Testing | **HIGH** | No |
| `ts-jest` | `^29.1.4` | TypeScript preprocessor for Jest | Testing | **CRITICAL** | No |
| `ts-loader` | `^9.5.1` | TypeScript loader for Webpack | Build Tool | **MEDIUM** | No |
| `ts-node` | `^10.9.2` | TypeScript execution environment for Node | Dev Engine | **HIGH** | No |
| `tsconfig-paths` | `^4.2.0` | Path alias resolver (`@/...`) | Build Tool | **HIGH** | No |
| `typescript` | `^5.4.5` | TypeScript compiler | Compiler | **CRITICAL** | No |

---

## 3. Vulnerability & Deprecation Analysis

- **Deprecated Packages**: Zero deprecated packages detected (`0 deprecated packages`).
- **Critical Vulnerabilities**: Zero high/critical advisories found (`npm audit` clean).
- **Node.js LTS Alignment**: Node.js 20.x LTS targeted across `@types/node ^20.14.2` and Docker image `node:20-alpine`.
