# 🛡️ Enterprise Security Hardening Guide
## TrustZone Mobile Care ERP — Version 11.0.0

This guide details the security posture, authentication controls, cryptography standards, RBAC policies, and threat mitigation mechanisms implemented across **TrustZone Mobile Care ERP**.

---

## 1. Production Security Checklist

| Security Control | Implementation Mechanism | Status |
|:---|:---|:---:|
| **HTTPS / TLS 1.3** | Nginx Reverse Proxy with Let's Encrypt certificates | ✅ ACTIVE |
| **HTTP Security Headers** | Helmet Middleware (`helmet()`) | ✅ ACTIVE |
| **JWT Access Control** | Short-lived JWT access tokens (15m) + Refresh tokens (7d) | ✅ ACTIVE |
| **Password Hashing** | Argon2 / bcrypt algorithm with dynamic salt rounds | ✅ ACTIVE |
| **Role-Based Access Control** | `@UseGuards(JwtAuthGuard, PermissionsGuard)` across 100% of endpoints | ✅ ACTIVE |
| **Rate Limiting (Anti-DoS)** | NestJS `@nestjs/throttler` (60 req / min window) | ✅ ACTIVE |
| **Database Encryption** | AES-256-GCM encryption for integration credentials (`IntegrationService`) | ✅ ACTIVE |
| **Input Sanitization** | `ValidationPipe` with `transform: true` & `whitelist: true` | ✅ ACTIVE |
| **Audit Logging** | Immutable `AuditLog`, `AIAuditLog`, `SalesAudit`, `DocumentAudit` tables | ✅ ACTIVE |
| **SQL Injection Defense** | Parameterized queries enforced via Prisma ORM | ✅ ACTIVE |

---

## 2. HTTP Security Headers (Helmet Configuration)

The NestJS entry point (`main.ts`) initializes Helmet security headers:

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' },
}));
```

---

## 3. JWT & Session Security Architecture

### 3.1 Token Lifecycles & Storage
- **Access Token**: Short lifespan (15 minutes). Transmitted via HTTP `Authorization: Bearer <token>` header.
- **Refresh Token**: Longer lifespan (7 days). Stored in HTTP-only, secure, SameSite cookies or secure storage.
- **Token Revocation**: Blacklisted token JTI (JWT ID) strings are stored in Redis (`RedisService`). Logouts immediately invalidate active sessions.

### 3.2 Password Hashing
All user credentials are stored as salted cryptographic hashes using `argon2` or `bcrypt` (12 salt rounds minimum). Plaintext passwords are never stored or logged.

---

## 4. Role-Based Access Control (RBAC) & Fine-Grained Permissions

Permissions are evaluated dynamically on every endpoint via `PermissionsGuard` and `@Permissions(...)` decorators:

```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('finance:accounts:write')
@Post('/accounts')
async createAccount(@Body() dto: CreateAccountDto) { ... }
```

### System Roles
- `SUPER_ADMIN`: Full unrestricted access across all 33 modules.
- `BRANCH_MANAGER`: Operational access restricted to branch ID.
- `FINANCE_OFFICER`: General Ledger, Accounts Payable, Accounts Receivable access.
- `TECHNICIAN`: Work Order, Diagnostic, Repair Ticket assignment access.
- `CASHIER`: POS Shift, Billing, Retail Sales access.
- `CUSTOMER`: Self-service portal access (view own tickets and devices).

---

## 5. Rate Limiting & Throttler Protection

Rate limiting is enforced globally via `ThrottlerGuard` in `AppModule`:

```typescript
ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => [
    {
      ttl: config.get<number>('THROTTLER_TTL', 60000),
      limit: config.get<number>('THROTTLER_LIMIT', 60),
    },
  ],
})
```

Requests exceeding the threshold return `429 Too Many Requests`.

---

## 6. Audit Logging & Security Event Tracking

Every state-modifying action (create, update, delete, role assignment, login attempt, price override) triggers an immutable audit log record:

- `AuditLog`: General system actions (user, timestamp, target entity, IP address, user agent).
- `SecurityEvent`: Security alerts (failed login spams, privilege escalation attempts, suspicious IP changes).
- `SalesAudit`: Price overrides, suspended sales, voided transactions in POS module.
