# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for compiling native addons (e.g., bcrypt, argon2) and openssl for Prisma
RUN apk add --no-cache python3 make g++ gcc openssl

# Copy dependency configuration files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy application source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the NestJS application (which builds the app and prunes devDependencies)
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies (openssl is required by Prisma engine)
RUN apk add --no-cache openssl

# Copy production files and dependencies
COPY package*.json ./
COPY prisma ./prisma/
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose the application port
EXPOSE 4000

# Use non-root user for security (least privilege)
USER node

# Start command runs migrations first then starts the application
CMD ["npm", "run", "start:prod"]
