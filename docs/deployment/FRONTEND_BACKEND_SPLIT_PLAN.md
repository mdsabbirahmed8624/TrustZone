# ✂️ Frontend & Backend Architecture Split Plan
## TrustZone Mobile Care ERP — Master Repository Strategy

> **Status**: APPROVED MIGRATION PLAN  
> **Execution Mode**: NON-BREAKING STAGED REFACTORING  
> **Target Date**: Post-v11.0.0 Release Cut  

---

## 1. Current Monorepo vs Standalone Structure

The project currently operates as a dual-root repository:
- **Root Directory (`/`)**: Hosts the NestJS 10.3 backend service, Prisma ORM schema, Docker infrastructure, and deployment configs.
- **Frontend Subdirectory (`/frontend`)**: Hosts a standalone Next.js 16 / React 19 web application.

```
c:\TrustZone Mobile Care\
├── dist/                        # Compiled NestJS backend code
├── docs/                        # Deployment documentation pack
├── node_modules/                # Backend node modules
├── prisma/                      # Prisma ORM schema & migrations
│   └── schema.prisma            # 220+ Data Models
├── src/                         # NestJS Backend Source (33 Modules)
│   ├── modules/                 # Domain modules (POS, CRM, Finance, etc.)
│   ├── health/                  # Health check controller
│   └── main.ts                  # NestJS entry point
├── frontend/                    # Next.js 16 Web Application
│   ├── public/                  # Static web assets
│   ├── src/                     # Next.js React components & pages
│   ├── next.config.ts           # Next.js configuration
│   ├── package.json             # Frontend package manifest
│   └── tsconfig.json            # Frontend TypeScript config
├── docker-compose.yml           # Multi-container orchestration
├── Dockerfile                   # Backend Docker build image
├── package.json                 # Backend package manifest
└── tsconfig.json                # Backend TypeScript config
```

---

## 2. Target Repository Architecture

To allow independent CI/CD pipelines, autoscaling, and developer team isolation, the codebase is prepared for two specialized long-term tracking branches:

### 2.1 Backend Target Structure (`backend-main` branch)
```
trustzone-mobile-care-backend/
├── docs/                        # Backend & DevOps documentation
├── prisma/                      # Prisma ORM schema & migrations
├── src/                         # 33 NestJS Domain Modules
├── test/                        # E2E test suites
├── Dockerfile                   # Optimized Node 20 runner
├── docker-compose.yml           # PostgreSQL & Redis stack
├── package.json                 # NestJS dependencies only
└── tsconfig.json                # Node 20 ES2021 compiler config
```

### 2.2 Frontend Target Structure (`frontend-main` branch)
```
trustzone-mobile-care-frontend/
├── public/                      # Static assets & brand media
├── src/                         # Next.js React 19 components & UI
├── next.config.ts               # Next.js build config
├── package.json                 # Frontend dependencies (Next 16, React 19, Tailwind v4)
└── tsconfig.json                # Next.js TypeScript config
```

---

## 3. Step-by-Step Migration & Separation Workflow

### Phase A — Long-Term Branch Creation (Zero Downtime)
1. Maintain `main` as the consolidated monorepo reference containing both `/src` and `/frontend`.
2. Create `backend-main` branch tracking backend releases.
3. Create `frontend-main` branch tracking frontend releases.
4. Existing Railway and Render deployments pointing to `main` or `phase-11-final-audit` remain 100% operational without disruption.

### Phase B — Independent Repository Provisioning (Optional Future Step)
If the organization requires separate GitHub repositories (`trustzone-backend` and `trustzone-frontend`):
1. Export `backend-main` to a dedicated `trustzone-mobile-care-backend` GitHub repository using `git filter-repo`.
2. Export `frontend-main` to a dedicated `trustzone-mobile-care-frontend` GitHub repository.
3. Re-point Railway / Render / Vercel web services to the respective standalone repositories.

---

## 4. Import & Path Adjustments

- **Backend Paths**: Zero import path changes required (`@/...` aliases map to `src/`).
- **Frontend Paths**: Next.js API client base URL configured via environment variable:
  ```env
  NEXT_PUBLIC_API_BASE_URL="https://api.trustzone.care/api/v1"
  NEXT_PUBLIC_WS_BASE_URL="wss://api.trustzone.care/realtime"
  ```

---

## 5. Deployment Impact & Risk Analysis

| Risk Factor | Impact Level | Mitigation Strategy |
|:---|:---:|:---|
| **PaaS Build Failures** | Medium | Maintain `main` branch with intact `/frontend` subfolder until standalone PaaS web services are verified. |
| **CORS Policy Disconnection** | Low | CORS in NestJS (`main.ts`) permits origin `https://app.trustzone.care`. |
| **Prisma Type Synchronization** | Low | OpenAPI Swagger spec (`/docs`) exports TypeScript client SDK for frontend consume. |

---

## 6. Rollback & Fail-Safe Strategy

If any deployment issue arises during branch splitting:
1. Instantly switch PaaS deployment branch back to `main`.
2. Re-trigger build from `main` HEAD commit.
3. `main` contains the complete, battle-tested, unified codebase.
