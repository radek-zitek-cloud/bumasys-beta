# Docker Deployment Guide for Bumasys

This guide explains how to deploy the Bumasys application using Docker, including both production and development setups.

## Overview

Bumasys consists of two main services:
- **Backend**: Node.js + Express + Apollo GraphQL server (port 4000)
- **Frontend**: Vue 3 + Vuetify served by Nginx (port 80)

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB RAM available for containers

## Quick Start - Production Deployment

1. **Clone the repository and navigate to the project root:**
   ```bash
   git clone <repository-url>
   cd bumasys-beta
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env file with your production values
   nano .env
   ```

3. **Build and start the services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost
   - Backend GraphQL: http://localhost:4000/graphql

## Development Setup

For development with hot-reload and mounted source code:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:4000/graphql
```

## Environment Variables

### Backend Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for JWT token signing | - | Yes |
| `DB_FILE` | Path to database file | `/app/data/database.json` | No |
| `BETTER_STACK_ENABLED` | Enable BetterStack logging | `false` | No |
| `BETTER_STACK_SOURCE_TOKEN` | BetterStack source token | - | No |

### Frontend Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL for development | `http://localhost:4000` | No |

## Commands

### Production Deployment

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Remove everything including volumes
docker-compose down -v
```

### Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

### Individual Services

```bash
# Build only backend
docker-compose build backend

# Build only frontend
docker-compose build frontend

# Restart a specific service
docker-compose restart backend
```

## Data Persistence

The backend database is stored in a Docker volume:
- **Production**: `backend_data` volume
- **Development**: `backend_dev_data` volume

Data persists across container restarts and rebuilds.

### Backup Database

```bash
# Create backup
docker run --rm -v bumasys-beta_backend_data:/data -v $(pwd):/backup alpine tar czf /backup/database-backup.tar.gz -C /data .

# Restore backup
docker run --rm -v bumasys-beta_backend_data:/data -v $(pwd):/backup alpine tar xzf /backup/database-backup.tar.gz -C /data
```

## Health Checks

Both services include health checks:
- **Backend**: GraphQL endpoint connectivity test
- **Frontend**: HTTP availability test

Health status can be checked with:
```bash
docker-compose ps
```

## Networking

Services communicate through an internal Docker network (`bumasys-network`):
- Frontend → Backend: `http://backend:4000`
- External access: Frontend (port 80), Backend (port 4000)

## Security Considerations

### Production Deployment

1. **Change default JWT secret**: Use a strong, random secret key
2. **Environment variables**: Store sensitive data in `.env` file (not committed to git)
3. **HTTPS**: Use a reverse proxy (like Nginx or Traefik) for SSL termination
4. **Firewall**: Restrict access to necessary ports only

### Recommended Production Setup

```yaml
# Example with reverse proxy
version: '3.8'
services:
  nginx-proxy:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80 and 4000 are available
2. **Memory issues**: Increase Docker memory allocation if builds fail
3. **Permission issues**: Ensure Docker has proper permissions

### Debugging

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend

# Execute commands in container
docker-compose exec backend sh
docker-compose exec frontend sh

# Check resource usage
docker stats
```

### Build Issues

```bash
# Clean build (remove cache)
docker-compose build --no-cache

# Prune Docker system
docker system prune -a
```

## Performance Optimization

### Production Optimizations

1. **Multi-stage builds**: Already implemented for smaller images
2. **Nginx caching**: Static assets are cached with proper headers
3. **Gzip compression**: Enabled in nginx configuration
4. **Health checks**: Prevent traffic to unhealthy containers

### Resource Limits

Add resource limits to docker-compose.yml:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
  frontend:
    deploy:
      resources:
        limits:
          memory: 128M
        reservations:
          memory: 64M
```

## Monitoring

### Log Aggregation

For production, consider:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Fluentd
- BetterStack (already integrated)

### Metrics

Monitor container metrics:
```bash
# Built-in monitoring
docker stats

# Export metrics (if using Prometheus)
# Add prometheus exporters to docker-compose.yml
```

## Updates and Maintenance

### Updating the Application

1. **Pull latest code:**
   ```bash
   git pull origin main
   ```

2. **Rebuild and restart:**
   ```bash
   docker-compose up -d --build
   ```

3. **Verify health:**
   ```bash
   docker-compose ps
   ```

### Scaling

Scale services horizontally:
```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Use load balancer for distribution
```

## Support

For issues and questions:
1. Check container logs: `docker-compose logs`
2. Verify environment configuration
3. Ensure all prerequisites are met
4. Check Docker and Docker Compose versions

## Files Structure

```
bumasys-beta/
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── .env.example               # Environment variables template
├── .dockerignore             # Root Docker ignore file
├── be/
│   ├── Dockerfile           # Backend production image
│   └── .dockerignore       # Backend specific ignores
├── fe/
│   ├── Dockerfile          # Frontend production image
│   ├── nginx.conf         # Nginx configuration
│   └── .dockerignore      # Frontend specific ignores
└── docs/
    └── DOCKER_DEPLOYMENT.md  # This file
```