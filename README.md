# BCN News - Barcelona Digital News Platform

A modern news platform built with Next.js 14, featuring a complete admin panel for content management.

## 🚀 Production Deployment

**Live URL**: https://blainenews.n9xo.xyz

### Quick Deploy
```bash
git push origin main  # GitHub Actions + Watchtower auto-deploy!
```

See [DEPLOY.md](DEPLOY.md) for full deployment guide.

## 📋 Documentation

- **[DEPLOY.md](DEPLOY.md)** - Production deployment quick reference
- **[GITHUB_SETUP.md](GITHUB_SETUP.md)** - GitHub Container Registry setup
- **[DOCKER.md](DOCKER.md)** - Complete Docker documentation

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Deployment**: Docker + GitHub Actions + Watchtower
- **Notifications**: Sonner

## 🏃 Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL (or use Docker)
- pnpm (recommended) or npm

### Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Setup database**:
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   pnpm prisma db seed
   ```

4. **Run development server**:
   ```bash
   pnpm dev
   ```

5. **Open** http://localhost:3000

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

⚠️ Change these immediately in production!

## 🐳 Docker Development

```bash
# Start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

## ✨ Features

### Public Site
- 📰 Article browsing with categories
- 🔍 Search functionality
- 📱 Responsive design
- 🎨 Modern brutalist UI

### Admin Panel (`/admin`)
- 👥 **User Management** - Create, edit, delete users with role-based access
- 📝 **Article Management** - Full CRUD operations with rich text editor
- 🎯 **Ad Management** - Dynamic advertisement system
- 👤 **Profile Management** - Update bio and display name
- 🔐 **Role-Based Permissions** (ADMIN, CHIEF_EDITOR, EDITOR, AUTHOR)

## 📦 Project Structure

```
bcn/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── (public)/          # Public pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities & configurations
├── prisma/               # Database schema & migrations
├── .github/workflows/    # GitHub Actions CI/CD
└── public/               # Static assets
```

## 🔒 Security

- Password hashing with bcryptjs
- Session-based authentication
- Protected API routes
- Role-based access control
- Environment variable validation

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Contact the repository owner for access.
