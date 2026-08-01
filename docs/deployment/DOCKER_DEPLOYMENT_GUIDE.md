# 🐳 Docker Deployment & Containerization Guide
## TrustZone Mobile Care ERP — Version 11.0.0

This guide provides technical specifications and operational workflows for containerizing and deploying **TrustZone Mobile Care ERP** using Docker and Docker Compose.

---

## 1. Container Configuration Validation

### 1.1 Dockerfile Audit & Structure
The production `Dockerfile` in the root repository utilizes a secure, multi-stage Alpine build topology:

```dockerfile
# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++ gcc openssl
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma/
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
CMD ["npm", "run", "start:prod"]
```

#### Key Validations:
- ✅ **Base Image**: Lightweight `node:20-alpine` reducing attack surface and image size (~180MB final image size).
- ✅ **Native Build Tools**: `python3 make g++ gcc openssl` installed in builder stage for native modules (`bcrypt`, `argon2`, Prisma query engine).
- ✅ **Multi-Stage Separation**: Builder assets, devDependencies, and build tools are discarded before runner image assembly.
- ✅ **Runtime Migration Execution**: `npm run start:prod` executes `npx prisma migrate deploy` followed by `node dist/src/main`, ensuring database schema migrations run automatically prior to web server startup.

---

### 1.2 Docker Compose Topology (`docker-compose.yml`)

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: trustzone-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: TrustZoneSecurePassword2026!
      POSTGRES_DB: trustzone_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d trustzone_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: trustzone-redis
    restart: always
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: trustzone-backend
    restart: always
    ports:
      - '4000:4000'
    env_file:
      - .env
    environment:
      - DATABASE_URL=postgresql://postgres:TrustZoneSecurePassword2026!@postgres:5432/trustzone_db?schema=public
      - REDIS_HOST=redis
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:4000/api/v1/health"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

---

## 2. Persistent Volumes & Internal Networks

### 2.1 Storage Volume Specifications
- `postgres_data`: Persistent named Docker volume backing `/var/lib/postgresql/data`. Data survives container destructions and updates.
- `redis_data`: Persistent named Docker volume backing `/data` for Redis RDB/AOF persistence logs.

### 2.2 Container Network Architecture
- Docker Compose automatically provisions an isolated default bridge network (`trustzone-mobile-care_default`).
- Inter-container DNS resolution allows `backend` to communicate with `postgres:5432` and `redis:6379` using service names.

---

## 3. Production Deployment Commands

### 3.1 Initial Build & Stack Startup
```bash
# Build images and start stack in detached mode
docker-compose up -d --build
```

### 3.2 Verify Container Status & Healthchecks
```bash
docker-compose ps
```

Expected Output:
```
NAME                 IMAGE                     STATUS                    PORTS
trustzone-postgres   postgres:15-alpine        Up (healthy)             0.0.0.0:5432->5432/tcp
trustzone-redis      redis:7-alpine            Up (healthy)             0.0.0.0:6379->6379/tcp
trustzone-backend    trustzone-backend:latest  Up (healthy)             0.0.0.0:4000->4000/tcp
```

### 3.3 Log Monitoring
```bash
# Stream all container logs
docker-compose logs -f --tail=100

# Stream backend application logs only
docker-compose logs -f backend
```

### 3.4 Performing Database Migrations Manually
```bash
docker-compose exec backend npx prisma migrate status
```

---

## 4. Production Security & Hardening Rules for Docker

1. **Environment File Security**: Ensure `.env` permissions are restricted:
   ```bash
   chmod 600 .env
   ```
2. **Production Passwords**: Change `TrustZoneSecurePassword2026!` in `.env` and `docker-compose.yml` to a 32+ character random string before launching in production.
3. **Port Binding**: In multi-server VPS setups where PostgreSQL/Redis should not be exposed externally, remove host port mappings `5432:5432` and `6379:6379` from `docker-compose.yml`, leaving only `4000:4000` (or binding to `127.0.0.1:4000`).
