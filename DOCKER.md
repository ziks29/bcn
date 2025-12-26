# Docker Setup for BCN News Application

## Overview
This project is configured with **2 Docker containers**:
1. **PostgreSQL Database** - Stores application data
2. **Next.js Application** - Main web application

## System Architecture

```mermaid
graph LR
    A[User] -->|Port 3000| B[Next.js App Container]
    B -->|Internal Network| C[PostgreSQL Container]
    C -->|Persistent Storage| D[Docker Volume]
```

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v3.8+
- At least 2GB of available RAM

## Quick Start

### 1. Start Both Containers
```bash
npm run docker:up
```
or
```bash
docker-compose up -d
```

### 2. View Logs
```bash
npm run docker:logs
```
or
```bash
docker-compose logs -f
```

### 3. Stop Containers
```bash
npm run docker:down
```
or
```bash
docker-compose down
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build Docker images |
| `npm run docker:up` | Start containers in detached mode |
| `npm run docker:down` | Stop and remove containers |
| `npm run docker:logs` | View container logs |

## Container Details

### Container 1: PostgreSQL (bcn_postgres)
- **Image**: `postgres:15-alpine`
- **Port**: `5432`
- **Volume**: `postgres_data` (persistent storage)
- **Health Check**: Checks database readiness every 10s
- **Environment Variables**:
  - `POSTGRES_USER`: postgres
  - `POSTGRES_PASSWORD`: postgres
  - `POSTGRES_DB`: bcn_news

### Container 2: Next.js App (bcn_app)
- **Build**: Multi-stage Dockerfile
- **Port**: `3000`
- **Depends On**: PostgreSQL (waits for health check)
- **Startup Process**:
  1. Waits for PostgreSQL to be healthy
  2. Runs database migrations (`prisma migrate deploy`)
  3. Seeds the database (`prisma db seed`)
  4. Starts the Next.js server

## Environment Variables

The containers use the `.env` file for configuration:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=bcn_news
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bcn_news?schema=public"

# Next Auth
NEXTAUTH_SECRET="super-secret-development-key-change-in-prod"
NEXTAUTH_URL="http://localhost:3000"
```

> **Note**: When running in Docker, the app container uses `@postgres` instead of `@localhost` in the DATABASE_URL.

## Networking

Both containers are connected via a custom bridge network (`bcn_network`):
- Containers can communicate using service names (e.g., `postgres:5432`)
- Isolated from other Docker networks
- Secure internal communication

## Data Persistence

PostgreSQL data is stored in a Docker volume:
- **Volume Name**: `postgres_data`
- **Location**: `/var/lib/postgresql/data` (inside container)
- **Persistence**: Data survives container restarts and rebuilds

## Troubleshooting

### Containers won't start
```bash
# Check container status
docker ps -a

# View detailed logs
docker-compose logs
```

### Database connection issues
```bash
# Check PostgreSQL health
docker exec bcn_postgres pg_isready -U postgres

# Connect to PostgreSQL directly
docker exec -it bcn_postgres psql -U postgres -d bcn_news
```

### Reset everything
```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Rebuild and restart
npm run docker:build
npm run docker:up
```

### Port already in use
If port 3000 or 5432 is already in use:
```bash
# Stop local development servers
# Or modify ports in docker-compose.yml
```

## Production Deployment

### Standard Deployment

For production:
1. Update `NEXTAUTH_SECRET` with a secure random string
2. Update `POSTGRES_PASSWORD` with a strong password
3. Update `NEXTAUTH_URL` to your production domain (https://blainenews.n9xo.xyz)
4. Consider using Docker secrets for sensitive data
5. Add SSL/TLS certificates
6. Configure a reverse proxy (nginx, Caddy)

### Watchtower Auto-Deployment with GitHub

The project uses **GitHub Actions** for automatic Docker builds and **Watchtower** for auto-deployment.

#### How It Works

1. **Push to GitHub** → Triggers GitHub Actions
2. **GitHub Actions** → Builds Docker image and pushes to GitHub Container Registry (ghcr.io)
3. **Watchtower on VPS** → Detects new image and auto-deploys

#### Setup on VPS (One-time)

1. **Create GitHub Personal Access Token (PAT)**:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `read:packages` permission
   - Copy the token

2. **Login to GHCR on VPS**:
   ```bash
   echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```

3. **Set Environment Variable**:
   ```bash
   # Add to .env or .env.docker
   GITHUB_REPOSITORY=your-github-username/bcn
   ```

4. **Start Containers**:
   ```bash
   docker-compose up -d
   ```

#### Deployment Workflow

Once set up, deployment is automatic:

```bash
# 1. Make changes to your code
# 2. Commit and push to GitHub
git add .
git commit -m "Your changes"
git push origin main

# 3. GitHub Actions automatically:
#    - Builds the Docker image
#    - Pushes to ghcr.io/your-username/bcn:latest

# 4. Watchtower on VPS automatically (within ~5 minutes):
#    - Detects the new image
#    - Pulls it from GHCR
#    - Stops the old container
#    - Starts the new container
#    - Cleans up old images
```

#### Manual Deployment (if needed)

```bash
# On VPS: Pull and restart manually
docker-compose pull app
docker-compose up -d app
```

#### Monitoring Deployments

```bash
# Check GitHub Actions status
# Visit: https://github.com/your-username/bcn/actions

# On VPS: View Watchtower logs
docker logs watchtower

# View app logs
docker-compose logs -f app
```

## Docker Build Stages

The Dockerfile uses multi-stage builds for optimization:

1. **deps**: Installs dependencies
2. **builder**: Generates Prisma client and builds Next.js
3. **runner**: Production runtime (minimal, optimized)

This results in a smaller final image (~200MB vs ~1GB).

## Accessing the Application

Once containers are running:
- **Web Application**: http://localhost:3000
- **Database**: `localhost:5432` (from host machine)

## Health Checks

PostgreSQL container includes health checks:
- Runs every 10 seconds
- Times out after 5 seconds
- Retries up to 5 times
- Next.js container waits for healthy status before starting

## Maintenance

### View container stats
```bash
docker stats bcn_postgres bcn_app
```

### Backup database
```bash
docker exec bcn_postgres pg_dump -U postgres bcn_news > backup.sql
```

### Restore database
```bash
docker exec -i bcn_postgres psql -U postgres bcn_news < backup.sql
```
