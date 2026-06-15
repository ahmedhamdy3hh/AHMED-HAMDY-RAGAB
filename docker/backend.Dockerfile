# Multi-stage production container setup for Cyber Guard Bot platform
# Stage 1: Build front-and-backend application assets
FROM node:22-slim AS builder

WORKDIR /app

# Install build prerequisites
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

# Copy full workspace files
COPY . .

# Build the react-app bundle and compile custom Express server.ts to dist/server.cjs
ENV NODE_ENV=production
RUN npm run build

# Remove development dependencies for optimized footprint size
RUN npm prune --production

# Stage 2: Optimized production container
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# OpenSSL compliance and dynamic curl checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy build output and production configurations
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Create secure user context (Non-root authorization guideline)
RUN groupadd -r cyberguard && useradd -r -g cyberguard cyberguard \
    && chown -R cyberguard:cyberguard /app
USER cyberguard

EXPOSE 3000

# Container healthcheck testing HTTP endpoints
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/metrics || exit 1

ENTRYPOINT ["node", "dist/server.cjs"]
