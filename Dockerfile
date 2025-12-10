# Multi-stage build for GoCortex Showcase

# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Run validation (requires GITHUB_TOKEN for full validation)
# ARG GITHUB_TOKEN
# ENV GITHUB_TOKEN=${GITHUB_TOKEN}
# RUN npx tsx scripts/validate.ts

# Run enrichment (optional - requires GITHUB_TOKEN)
# Uncomment to enrich at build time
# ARG GITHUB_TOKEN
# ENV GITHUB_TOKEN=${GITHUB_TOKEN}
# RUN npx tsx scripts/enrich.ts

# Build static site
# Set BASE_PATH for deployment (default to root)
ARG BASE_PATH=/
RUN npx vite build --base ${BASE_PATH}

# Stage 2: Production with Nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
