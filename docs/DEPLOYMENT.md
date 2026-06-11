# Deployment Guide

## Docker Deployment (Production)

### 1. Environment Configuration

Create a `.env.production` file:

```env
POSTGRES_SERVER=db
POSTGRES_PORT=5432
POSTGRES_USER=carbonverse
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_DB=carbonverse
SECRET_KEY=your-256-bit-secret-key-here
REDIS_URL=redis://redis:6379/0
CORS_ORIGINS=["https://yourdomain.com"]
ENVIRONMENT=production
```

### 2. Build and Deploy

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Run database migrations
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Check status
docker compose -f docker-compose.prod.yml ps
```

### 3. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: "3.9"
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    environment:
      POSTGRES_SERVER: ${POSTGRES_SERVER}
      POSTGRES_PORT: ${POSTGRES_PORT}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
      SECRET_KEY: ${SECRET_KEY}
      REDIS_URL: ${REDIS_URL}
      CORS_ORIGINS: ${CORS_ORIGINS}
      ENVIRONMENT: production
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/ssl/certs
    depends_on:
      - backend
    restart: always

volumes:
  pgdata:
```

## Vercel Deployment (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL
```

## AWS Deployment

### ECS Fargate

1. Push images to ECR
2. Create ECS cluster
3. Define task definitions for backend and frontend
4. Create services with load balancer

### RDS for PostgreSQL

```bash
aws rds create-db-instance \
  --db-instance-identifier carbonverse-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username carbonverse \
  --master-user-password <password> \
  --allocated-storage 20
```

## Monitoring

- Application logs: `docker compose logs -f backend`
- Health check: `curl http://localhost:8000/health`
- Database status: `docker compose exec db pg_isready`

## SSL/TLS

Use Let's Encrypt with Certbot:

```bash
certbot --nginx -d yourdomain.com
```

## Backup

```bash
# Database backup
docker compose exec db pg_dump -U carbonverse carbonverse > backup.sql

# Restore
docker compose exec -T db psql -U carbonverse carbonverse < backup.sql
```
