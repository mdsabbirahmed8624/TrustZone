# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency configuration files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY . .

# Environment variable for build time API URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build Next.js application
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy production artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expose default port
EXPOSE 3000

# Use non-root user for security (least privilege)
USER node

# Start command executes Next.js server on Railway $PORT
CMD ["npx", "next", "start"]
