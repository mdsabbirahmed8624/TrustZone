# 🛠️ TrustZone Mobile Care — Enterprise ERP System

**TrustZone Mobile Care ERP** is a full-stack, enterprise-grade smartphone diagnostics, repair management, inventory, POS, billing, CRM, and system administration platform built for high-volume service centers across Bangladesh.

---

## 🚀 Quick Start & Restoration Guide

### Prerequisites
- **Node.js**: `v20.x` or higher
- **PostgreSQL**: `v15.x` or higher
- **Redis**: `v7.x` or higher

### Installation & Environment Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/mdsabbirahmed8624/TrustZone.git
   cd TrustZone
   ```

2. **Backend Setup**:
   ```bash
   # Install dependencies
   npm install

   # Configure Environment Variables
   cp .env.example .env

   # Run Database Migrations & Seed Admin User
   npx prisma migrate deploy
   npx prisma db seed

   # Start NestJS Backend Server (Default: http://localhost:4000)
   npm run start:dev
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend

   # Install dependencies
   npm install

   # Configure Environment Variables
   cp .env.example .env.local

   # Start Next.js Development Server (Default: http://localhost:3000)
   npm run dev
   ```

---

## 🔑 Default Administrative Credentials

- **Admin Portal**: `http://localhost:3000/admin/login`
- **Email**: `admin@trustzone.care`
- **Password**: `Password123!`
- **Role**: `SUPER_ADMIN`

---

## 🏗️ Architecture Overview

- **Backend**: NestJS, TypeScript, Prisma ORM, PostgreSQL, Redis, Argon2, Passport JWT
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Lucide Icons, Recharts
- **Deployment**: Railway Cloud Platform (`https://ideal-vitality-production-8dfc.up.railway.app/`)

---

## 📜 License & Copyright

© 2026 TrustZone Mobile Care. All Rights Reserved.
