# Deployment Guide

This document provides a quick reference for deploying the BCN News application to production.

## Production Domain
- **URL**: https://blainenews.n9xo.xyz
- **Port**: 9999 (Docker) → 80/443 (Nginx)

## Quick Deploy Checklist

### One-Time Server Setup

1. **Install Docker & Docker Compose** on your VPS
2. **Install Nginx** and copy `nginx.conf` to `/etc/nginx/sites-available/bcn-news`
3. **Get SSL Certificate**:
   ```bash
   sudo certbot --nginx -d blainenews.n9xo.xyz
   ```
4. **Login to GitHub Container Registry**:
   ```bash
   echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
   ```
5. **Clone repository** and configure environment:
   ```bash
   git clone https://github.com/your-username/bcn.git
   cd bcn
   cp .env.docker.example .env.docker
   # Edit .env.docker with production values
   ```
6. **Start containers**:
   ```bash
   docker-compose up -d
   ```

### Environment Variables (Production)

Update `.env.docker` on your VPS:

```bash
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=bcn_news
DATABASE_URL="postgresql://postgres:<strong-password>@postgres:5432/bcn_news?schema=public"

# Authentication
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NEXTAUTH_URL="https://blainenews.n9xo.xyz"

# GitHub Registry
GITHUB_REPOSITORY=your-username/bcn
```

## Automated Deployment Workflow

Every push to `main` branch automatically:

1. ✅ **GitHub Actions** builds Docker image
2. ✅ **Pushes** to GitHub Container Registry
3. ✅ **Watchtower** detects and deploys new image (~5 minutes)

### To Deploy:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

That's it! 🚀

## Manual Commands

```bash
# Manual pull and restart
docker-compose pull app
docker-compose up -d app

# View logs
docker-compose logs -f app

# Database backup
docker exec bcn_postgres pg_dump -U postgres bcn_news > backup.sql

# Database restore  
docker exec -i bcn_postgres psql -U postgres bcn_news < backup.sql
```

## Monitoring

- **GitHub Actions**: https://github.com/your-username/bcn/actions
- **App logs**: `docker-compose logs -f app`
- **Watchtower logs**: `docker logs watchtower`
- **Nginx logs**: `sudo tail -f /var/log/nginx/error.log`
