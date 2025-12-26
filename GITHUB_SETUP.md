# GitHub Container Registry Setup

## Quick Setup Instructions

### 1. Enable GitHub Packages

Your Docker images will be automatically built and pushed to GitHub Container Registry when you push to the `main` branch.

### 2. First Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/bcn.git
git branch -M main
git push -u origin main
```

This will trigger the GitHub Actions workflow to build your Docker image.

### 3. On Your VPS - One-Time Setup

#### a. Create GitHub Personal Access Token

1. Go to GitHub: Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "VPS Docker Pull")
4. Select scope: **`read:packages`**
5. Generate and copy the token

#### b. Login to GHCR on VPS

```bash
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

#### c. Set Environment Variables

Create/update `.env.docker` on your VPS:

```bash
# Add this line (replace with your actual GitHub username/repo)
GITHUB_REPOSITORY=your-username/bcn
```

#### d. Start Watchtower (if not already running)

```bash
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 300 \
  --cleanup
```

### 4. Deploy!

Now every time you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push
```

**GitHub Actions** builds → **Watchtower** deploys automatically! 🎉

## Verify Setup

### Check GitHub Actions
Visit: `https://github.com/YOUR_USERNAME/bcn/actions`

You should see the workflow running after each push.

### Check Docker Image
Visit: `https://github.com/YOUR_USERNAME/bcn/pkgs/container/bcn`

Your Docker image should appear here after the first successful build.

### On VPS - Pull Image Manually (for testing)

```bash
docker pull ghcr.io/your-username/bcn:latest
```

## Troubleshooting

### "unauthorized: unauthenticated"
- Make sure you've logged in to GHCR on your VPS
- Verify your GitHub token has `read:packages` permission

### "no such image"
- Check that GitHub Actions completed successfully
- Visit GitHub Actions page to see build logs
- Make sure the image name matches in docker-compose.yml

### Watchtower not pulling updates
```bash
# Check Watchtower logs
docker logs watchtower

# Restart Watchtower
docker restart watchtower
```
