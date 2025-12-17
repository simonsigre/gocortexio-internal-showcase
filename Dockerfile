# Multi-stage build for GoCortex Showcase
# Production-ready containerized static site with security hardening

# Stage 1: Build
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Copy package files first (layer caching optimization)
COPY package*.json ./

# Install dependencies with strict verification
RUN npm ci --only=production=false --ignore-scripts && \
    npm cache clean --force

# Copy source code
COPY . .

# Build arguments
ARG GITHUB_TOKEN
ARG BASE_PATH=/

# Set environment variables for build
ENV GITHUB_TOKEN=${GITHUB_TOKEN}
ENV NODE_ENV=production

# Run auto-import (if GITHUB_TOKEN is provided)
RUN if [ -n "$GITHUB_TOKEN" ]; then \
        echo "Running repository import..." && \
        npx tsx scripts/import-org-repos.ts; \
    else \
        echo "Skipping import: GITHUB_TOKEN not provided"; \
    fi

# Run validation (content safety + dead link checks)
RUN npx tsx scripts/validate.ts

# Run enrichment (fetch GitHub stats if GITHUB_TOKEN is provided)
RUN if [ -n "$GITHUB_TOKEN" ]; then \
        echo "Running data enrichment..." && \
        npx tsx scripts/enrich.ts; \
    else \
        echo "Skipping enrichment: GITHUB_TOKEN not provided"; \
    fi

# Build static site with specified base path
RUN npx vite build --base ${BASE_PATH}

# Verify build output exists
RUN test -f /app/dist/public/index.html || (echo "Build failed: index.html not found" && exit 1)

# Stage 2: Production with Nginx
FROM nginx:1.26-alpine AS production

# Add metadata labels (OCI standard)
LABEL org.opencontainers.image.title="GoCortex Showcase" \
      org.opencontainers.image.description="Static site generator for Palo Alto Networks Cortex ecosystem projects" \
      org.opencontainers.image.vendor="Palo Alto Networks" \
      org.opencontainers.image.licenses="MIT" \
      maintainer="Palo Alto Networks"

# Install security updates and minimal runtime dependencies
RUN apk upgrade --no-cache && \
    apk add --no-cache \
    curl \
    tzdata && \
    rm -rf /var/cache/apk/*

# Create non-root user for nginx
RUN addgroup -g 101 -S nginx-app && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx-app -g nginx-app nginx-app && \
    chown -R nginx-app:nginx-app /var/cache/nginx && \
    chown -R nginx-app:nginx-app /var/log/nginx && \
    chown -R nginx-app:nginx-app /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx-app:nginx-app /var/run/nginx.pid

# Copy custom nginx config with security headers
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Set proper permissions
RUN chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx-app

# Expose port
EXPOSE 80

# Health check with improved reliability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
