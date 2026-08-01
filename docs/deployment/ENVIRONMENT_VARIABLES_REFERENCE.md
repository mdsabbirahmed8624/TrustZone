# 🔑 Environment Variables Reference
## TrustZone Mobile Care ERP — Version 11.0.0

This reference details every environment variable supported, recognized, or configured across the TrustZone Mobile Care ERP system. All variables are parsed via `@nestjs/config` (`ConfigModule`) or `process.env`.

---

## 1. Master Environment Variable Matrix

| Variable Name | Required | Description | Default Value | Sensitive | Prod Required | Dev Required | Test Required |
|:---|:---:|:---|:---|:---:|:---:|:---:|:---:|
| `PORT` | No | HTTP Listening Port for Backend Service | `4000` | No | Optional | Optional | Optional |
| `NODE_ENV` | Yes | Application Runtime Environment Mode | `development` | No | Yes | Yes | Yes |
| `DATABASE_URL` | Yes | PostgreSQL Database Connection String | *None* | **Yes** | **Yes** | **Yes** | **Yes** |
| `DIRECT_URL` | No | Direct DB Connection for Migration Pools | *None* | **Yes** | Optional | Optional | Optional |
| `REDIS_HOST` | Yes | Redis Server Hostname | `localhost` | No | **Yes** | Yes | Optional |
| `REDIS_PORT` | Yes | Redis Server TCP Port | `6379` | No | **Yes** | Yes | Optional |
| `REDIS_PASSWORD` | No | Redis Server Password Authentication | *None* | **Yes** | **Yes** | Optional | Optional |
| `JWT_SECRET_KEY` | Yes | Primary JWT Signing Key for Access Tokens | *None* | **Yes** | **Yes** | Yes | Yes |
| `JWT_EXPIRES_IN` | No | Access Token Lifetime Duration | `15m` | No | Optional | Optional | Optional |
| `JWT_REFRESH_SECRET_KEY` | Yes | JWT Signing Key for Refresh Tokens | *None* | **Yes** | **Yes** | Yes | Yes |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh Token Lifetime Duration | `7d` | No | Optional | Optional | Optional |
| `JWT_SECRET` | No | Fallback JWT secret key for integration module | *None* | **Yes** | Optional | Optional | Optional |
| `STRIPE_API_KEY` | No | Stripe Secret API Key for Payments | *None* | **Yes** | Optional | Optional | Optional |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe Webhook Signature Verification Key | *None* | **Yes** | Optional | Optional | Optional |
| `TWILIO_ACCOUNT_SID` | No | Twilio Account SID for SMS Dispatch | *None* | **Yes** | Optional | Optional | Optional |
| `TWILIO_AUTH_TOKEN` | No | Twilio Auth Token | *None* | **Yes** | Optional | Optional | Optional |
| `TWILIO_PHONE_NUMBER` | No | Twilio Sender Phone Number | *None* | No | Optional | Optional | Optional |
| `SENDGRID_API_KEY` | No | SendGrid API Key for Email Delivery | *None* | **Yes** | Optional | Optional | Optional |
| `SENDGRID_FROM_EMAIL` | No | Verified Sender Email Address | *None* | No | Optional | Optional | Optional |
| `THROTTLER_TTL` | No | Rate Limiter Time-To-Live Window (ms) | `60000` | No | Optional | Optional | Optional |
| `THROTTLER_LIMIT` | No | Rate Limiter Max Requests per Window | `60` | No | Optional | Optional | Optional |

---

## 2. Detailed Parameter Specification

### 2.1 Core Application Configuration

#### `PORT`
- **Required**: No (Defaulted to `4000` in `main.ts` and `docker-compose.yml`)
- **Description**: TCP Port on which the NestJS HTTP server binds.
- **Default Value**: `4000`
- **Example Value**: `4000`
- **Sensitive**: No
- **Production Required**: No (Defaults to 4000 if omitted)
- **Development Required**: No
- **Testing Required**: No
- **Validation Rules**: Numeric integer between `1024` and `65535`.

#### `NODE_ENV`
- **Required**: Yes
- **Description**: Runtime mode controlling log verbosity, error stack formatting, and optimization.
- **Default Value**: `development`
- **Example Value**: `production`
- **Sensitive**: No
- **Production Required**: Yes (Must be set to `production`)
- **Development Required**: Yes (`development`)
- **Testing Required**: Yes (`test`)
- **Validation Rules**: Enum: `production` \| `development` \| `test`.

---

### 2.2 Database & Data Tier Configuration

#### `DATABASE_URL`
- **Required**: Yes
- **Description**: Full PostgreSQL connection URL used by Prisma ORM (`prisma/schema.prisma` & `PrismaService`).
- **Default Value**: *None*
- **Example Value**: `postgresql://postgres:TrustZoneSecurePassword2026!@localhost:5432/trustzone_db?schema=public`
- **Sensitive**: Yes (Contains DB password)
- **Production Required**: Yes
- **Development Required**: Yes
- **Testing Required**: Yes
- **Validation Rules**: Valid PostgreSQL URI string format with credentials, host, port, database name, and schema parameter.

#### `DIRECT_URL`
- **Required**: No
- **Description**: Direct non-pooled database connection string used for Prisma migrations when using connection poolers (e.g. PgBouncer / Supabase).
- **Default Value**: *None*
- **Example Value**: `postgresql://postgres:TrustZoneSecurePassword2026!@localhost:5432/trustzone_db?schema=public`
- **Sensitive**: Yes
- **Production Required**: No (Required only if PgBouncer pooler is active)
- **Development Required**: No
- **Testing Required**: No
- **Validation Rules**: Valid PostgreSQL URI string.
- **Note**: *Configuration not found in current codebase.* (Supported standard for Prisma deployments).

---

### 2.3 Redis Cache & Memory Tier

#### `REDIS_HOST`
- **Required**: Yes
- **Description**: Hostname or IP address of the Redis server (`RedisModule`).
- **Default Value**: `localhost`
- **Example Value**: `redis` (Docker service name) or `10.0.0.15`
- **Sensitive**: No
- **Production Required**: Yes
- **Development Required**: Yes
- **Testing Required**: Optional
- **Validation Rules**: Valid hostname, FQDN, or IPv4/IPv6 address.

#### `REDIS_PORT`
- **Required**: Yes
- **Description**: TCP port for Redis server connection.
- **Default Value**: `6379`
- **Example Value**: `6379`
- **Sensitive**: No
- **Production Required**: Yes
- **Development Required**: Yes
- **Testing Required**: Optional
- **Validation Rules**: Integer between `1` and `65535`.

#### `REDIS_PASSWORD`
- **Required**: No (Required if Redis server enforces AUTH)
- **Description**: Authentication password for Redis server.
- **Default Value**: *None*
- **Example Value**: `SuperSecretRedisPass2026!`
- **Sensitive**: Yes
- **Production Required**: Recommended
- **Development Required**: No
- **Testing Required**: No
- **Validation Rules**: String.

---

### 2.4 Security & Authentication Tokens

#### `JWT_SECRET_KEY`
- **Required**: Yes
- **Description**: HMAC Secret key for signing and verifying Access JSON Web Tokens (`AuthService`).
- **Default Value**: *None*
- **Example Value**: `c3a8f912e4b701d94f268e1a3b5c7d9e0f214365879a0b1c2d3e4f5a6b7c8d9e`
- **Sensitive**: Yes
- **Production Required**: Yes (Must be at least 32 random characters in production)
- **Development Required**: Yes
- **Testing Required**: Yes
- **Validation Rules**: Cryptographically secure random string (minimum 32 characters).

#### `JWT_EXPIRES_IN`
- **Required**: No
- **Description**: Lifetime duration string for JWT Access Tokens.
- **Default Value**: `15m`
- **Example Value**: `15m` or `1h`
- **Sensitive**: No
- **Production Required**: Optional
- **Development Required**: No
- **Testing Required**: No
- **Validation Rules**: Valid `zeit/ms` time string format (e.g., `15m`, `1h`, `900s`).

#### `JWT_REFRESH_SECRET_KEY`
- **Required**: Yes
- **Description**: Secret key for signing and validating Refresh JWT Tokens.
- **Default Value**: *None*
- **Example Value**: `f1d2e3c4b5a697887766554433221100aaffbbee112233445566778899001122`
- **Sensitive**: Yes
- **Production Required**: Yes
- **Development Required**: Yes
- **Testing Required**: Yes
- **Validation Rules**: Cryptographically secure string (minimum 32 characters).

#### `JWT_REFRESH_EXPIRES_IN`
- **Required**: No
- **Description**: Lifetime duration string for JWT Refresh Tokens.
- **Default Value**: `7d`
- **Example Value**: `7d` or `30d`
- **Sensitive**: No
- **Production Required**: Optional
- **Development Required**: No
- **Testing Required**: No
- **Validation Rules**: Valid `zeit/ms` string (e.g., `7d`, `14d`).

---

### 2.5 External Integrations & Payment Gateways

#### `STRIPE_API_KEY`
- **Required**: No (Required if Stripe payments enabled)
- **Description**: Stripe Secret API key for processing credit card transactions.
- **Default Value**: *None*
- **Example Value**: `sk_live_51Nx...`
- **Sensitive**: Yes
- **Production Required**: Optional
- **Development Required**: Optional
- **Testing Required**: Optional
- **Validation Rules**: String starting with `sk_live_` or `sk_test_`.

#### `STRIPE_WEBHOOK_SECRET`
- **Required**: No
- **Description**: Secret key for verifying incoming Stripe Webhook signatures.
- **Default Value**: *None*
- **Example Value**: `whsec_a1b2c3d4...`
- **Sensitive**: Yes
- **Production Required**: Optional
- **Development Required**: Optional
- **Testing Required**: Optional
- **Validation Rules**: String starting with `whsec_`.

#### `TWILIO_ACCOUNT_SID`
- **Required**: No (Required for SMS dispatch)
- **Description**: Twilio Account SID for sending SMS notifications to customers & technicians.
- **Default Value**: *None*
- **Example Value**: `AC_YOUR_TWILIO_ACCOUNT_SID_HERE`
- **Sensitive**: Yes
- **Production Required**: Optional
- **Development Required**: Optional
- **Testing Required**: Optional
- **Validation Rules**: String starting with `AC`.

#### `TWILIO_AUTH_TOKEN`
- **Required**: No
- **Description**: Twilio Authentication Token.
- **Default Value**: *None*
- **Example Value**: `9f8e7d6c5b4a3210fe`
- **Sensitive**: Yes
- **Production Required**: Optional
- **Development Required**: Optional
- **Testing Required**: Optional
- **Validation Rules**: 32-character string.

#### `TWILIO_PHONE_NUMBER`
- **Required**: No
- **Description**: E.164 formatted sender phone number provisioned on Twilio.
- **Default Value**: *None*
- **Example Value**: `+18005550199`
- **Sensitive**: No
- **Production Required**: Optional
- **Development Required**: Optional
- **Testing Required**: Optional
- **Validation Rules**: E.164 phone string (e.g., `+1...`).

#### `SENDGRID_API_KEY`
- **Required**: No (Required for email notifications)
- **Description**: SendGrid API key for automated email delivery.
- **Default Value**: *None*
- **Example Value**: `SG.a1b2c3d4...`
- **Sensitive**: Yes
- **Production Required**: Optional
- **Development Required**: Optional
- **Testing Required**: Optional
- **Validation Rules**: String starting with `SG.`.

#### `SENDGRID_FROM_EMAIL`
- **Required**: No
- **Description**: Sender email address for outbound transactional emails.
- **Default Value**: *None*
- **Example Value**: `noreply@trustzone.care`
- **Sensitive**: No
- **Production Required**: Optional
- **Development Required**: Optional
- **Testing Required**: Optional
- **Validation Rules**: Valid email address string.

---

### 2.6 Explicitly Audited Non-Configured Variables

The following variables were audited against the codebase:

- `SMTP_HOST`: *Configuration not found in current codebase.* (SendGrid API driver used in `.env.example`).
- `SMTP_PORT`: *Configuration not found in current codebase.*
- `SMTP_USER`: *Configuration not found in current codebase.*
- `SMTP_PASSWORD`: *Configuration not found in current codebase.*
- `CLOUDINARY_URL`: *Configuration not found in current codebase.* (Local file storage `/uploads` configured).
- `OPENAI_API_KEY`: *Configuration not found in current codebase.* (Custom heuristic AI Engine `src/modules/ai` used).
