# Docker Deployment Guide

This guide explains how to deploy the Room Management System using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 2GB RAM available
- Ports 3000, 3001, 5432, 6379 available

## Quick Start

### Development Environment

```bash
# Start development environment
./scripts/dev.sh

# Start backend development server
cd room-management-backend-nest
npm run start:dev

# Start frontend development server (in another terminal)
cd room-management-frontend-next
npm run dev
```

### Production Deployment

```bash
# Deploy to production
./scripts/deploy.sh
```

## Manual Deployment

### 1. Development Setup

```bash
# Start only database and Redis
docker-compose up -d db redis

# Run migrations and seed data
cd room-management-backend-nest
npm install
npx prisma migrate dev
npx prisma db seed

# Start development servers
npm run start:dev  # Backend
cd ../room-management-frontend-next && npm run dev  # Frontend
```

### 2. Production Setup

```bash
# Copy environment template
cp env.production .env

# Edit environment variables
nano .env

# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed database
docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

## Environment Variables

### Required Variables

```bash
# Database
POSTGRES_DB=room_management
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-super-secure-jwt-secret

# URLs
FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### Optional Variables

```bash
# Ports
BACKEND_PORT=3000
FRONTEND_PORT=3001
NGINX_PORT=80
NGINX_SSL_PORT=443

# Redis
REDIS_URL=redis://redis:6379
```

## Service URLs

After deployment, services are available at:

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432
- **Redis**: localhost:6379
- **Nginx** (if enabled): http://localhost:80

## Health Checks

All services include health checks:

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Check specific service health
docker-compose exec backend curl -f http://localhost:3000/hii
```

## Database Management

### Migrations

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Reset database
docker-compose exec backend npx prisma migrate reset

# View database
docker-compose exec backend npx prisma studio
```

### Backup

```bash
# Backup database
docker-compose exec db pg_dump -U postgres room_management > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres room_management < backup.sql
```

## Scaling

### Horizontal Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Scale frontend services
docker-compose up -d --scale frontend=2
```

### Load Balancing

The included Nginx configuration provides basic load balancing and rate limiting.

## Monitoring

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Resource Usage

```bash
# View resource usage
docker stats

# View service health
docker-compose ps
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose exec db pg_isready -U postgres
   
   # Restart database
   docker-compose restart db
   ```

3. **Build Failures**
   ```bash
   # Clean build
   docker-compose build --no-cache
   
   # Remove unused images
   docker system prune -a
   ```

### Reset Everything

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: This will delete all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Clean everything
docker system prune -a
```

## Security Considerations

1. **Change Default Passwords**: Update all default passwords in production
2. **Use HTTPS**: Configure SSL certificates for production
3. **Firewall**: Restrict database and Redis access to internal networks only
4. **Updates**: Regularly update base images and dependencies
5. **Secrets**: Use Docker secrets or external secret management for sensitive data

## Performance Optimization

1. **Resource Limits**: Set appropriate CPU and memory limits
2. **Caching**: Use Redis for session storage and caching
3. **Database**: Optimize PostgreSQL configuration for your workload
4. **CDN**: Use a CDN for static assets in production

## Support

For issues and questions:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Check service health: `docker-compose ps`
4. Review this documentation
