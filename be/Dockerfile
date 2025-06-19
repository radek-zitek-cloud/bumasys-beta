# Backend Dockerfile for Bumasys
# Multi-stage build for optimized production image

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm with SSL certificate handling
RUN npm config set strict-ssl false && npm install -g pnpm@10.12.1

# Copy package.json and lockfile
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm config set strict-ssl false && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install wget for healthcheck
RUN apk add --no-cache wget

# Set working directory
WORKDIR /app

# Install pnpm with SSL certificate handling
RUN npm config set strict-ssl false && npm install -g pnpm@10.12.1

# Copy package.json and lockfile
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm config set strict-ssl false && pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy config directory if it exists
COPY config ./config

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create database directory and set permissions
RUN mkdir -p /data && \
    chown -R nodejs:nodejs /data

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]