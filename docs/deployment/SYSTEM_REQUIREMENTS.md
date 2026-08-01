# 🖥️ System Hardware & Software Requirements
## TrustZone Mobile Care ERP — Version 11.0.0

This specification establishes the minimum and recommended hardware, operating system, container runtime, and database system requirements for deploying **TrustZone Mobile Care ERP**.

---

## 1. Production Server Hardware Requirements

### 1.1 Small Deployment (Up to 50 Concurrent Users / Single Branch)

| Hardware Parameter | Minimum Requirement | Recommended Specification |
|:---|:---|:---|
| **CPU / Processors** | 2 Virtual CPUs (vCPU) / Cores | 4 Virtual CPUs (vCPU) |
| **System RAM** | 4 GB RAM | 8 GB RAM |
| **Disk Storage (SSD)** | 40 GB NVMe / SSD | 100 GB NVMe SSD |
| **Network Bandwidth** | 100 Mbps NIC | 1 Gbps NIC (10 TB Transfer/mo) |
| **IOPS** | 1,000 IOPS | 3,000+ IOPS |

### 1.2 Enterprise Production Deployment (500+ Concurrent Users / Multi-Branch / POS Terminals)

| Hardware Parameter | Minimum Requirement | Recommended Specification |
|:---|:---|:---|
| **Application Tier (Backend)** | 4 vCPU, 8 GB RAM | 8 vCPU, 16 GB RAM (Node.js PM2 Cluster) |
| **Database Tier (PostgreSQL)** | 4 vCPU, 16 GB RAM, 200 GB SSD | 16 vCPU, 32 GB RAM, 500 GB NVMe SSD |
| **Cache Tier (Redis)** | 2 vCPU, 4 GB RAM | 4 vCPU, 8 GB RAM |
| **Network Bandwidth** | 1 Gbps dedicated | 10 Gbps dedicated |

---

## 2. Software & Operating System Dependencies

| Component | Minimum Version | Recommended Version | Reference |
|:---|:---|:---|:---|
| **Operating System** | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS / Debian 12 | Bare Metal / VPS |
| **Node.js Runtime** | `20.10.0` LTS | `20.14.0` LTS | `package.json` |
| **NPM Package Manager** | `10.0.0` | `10.8.0` | `package-lock.json` |
| **PostgreSQL Database** | `15.0` | `15.7` / `16.3` | `docker-compose.yml` |
| **Redis Cache** | `7.0` | `7.2` | `docker-compose.yml` |
| **Docker Engine** | `24.0.0` | `26.1.0+` | `Dockerfile` |
| **Docker Compose** | `2.20.0` | `2.27.0+` | `docker-compose.yml` |
| **Nginx Web Server** | `1.18.0` | `1.24.0+` | Reverse Proxy |
| **PM2 Process Manager** | `5.3.0` | `5.4.0` | Node Cluster |
| **Certbot (SSL/TLS)** | `1.21.0` | `2.9.0+` | Let's Encrypt |

---

## 3. Client Browser & Mobile Compatibility

### 3.1 Web Desktop / Tablet Compatibility
- **Google Chrome**: Version 115+
- **Mozilla Firefox**: Version 115+
- **Apple Safari**: Version 16+
- **Microsoft Edge**: Version 115+

### 3.2 Mobile Application Operating System
- **Android**: Android 10.0 (API Level 29) or higher
- **iOS**: iOS 16.0 or higher
