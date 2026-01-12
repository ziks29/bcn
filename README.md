# Blaine County News (BCN)

A modern, brutalist-style news platform built with Next.js 14, featuring a complete admin panel for content management. Inspired by the iconic news outlets of Blaine County.

> [!NOTE]
> Foundation for the "Truth is not mandatory" news experience.

## 🚀 Production Deployment

**Live URL**: [blainenews.n9xo.xyz](https://blainenews.n9xo.xyz)

### Quick Deploy
```bash
git push origin main  # GitHub Actions + Watchtower auto-deploy!
```

See [DEPLOY.md](DEPLOY.md) for the full deployment guide.

## 📋 Documentation

- **[DEPLOY.md](DEPLOY.md)** - Production deployment & CI/CD workflow
- **[DOCKER.md](DOCKER.md)** - Complete Docker & Nginx configuration
- **[GITHUB_SETUP.md](GITHUB_SETUP.md)** - GitHub Container Registry (GHCR) setup

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS (Brutalist Newspaper Aesthetic)
- **Deployment**: Docker + GitHub Actions + Watchtower
- **Notifications**: Sonner

## 🏃 Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL (or use Docker)
- pnpm (recommended), npm, or yarn

### Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your local database credentials
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

5. **Open** [http://localhost:3000](http://localhost:3000)

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

⚠️ *Change these immediately in production!*

## 🐳 Docker Development

For running the entire stack (App + Postgres) locally via Docker:

```bash
# Start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

## ✨ Features

### 📰 Public Site
- **Dynamic Articles**: Browse news by categories (Local, Crime, Politics, etc.)
- **Brutalist UI**: High-contrast, newspaper-inspired design.
- **Interactive Sidebar**: BAWSAQ stock ticker and Nazar's predictions.
- **Article Sharing**: Social shares and print-friendly views.

### 🔐 Admin Panel (`/admin`)
- **User Management**: Role-based access control (ADMIN, CHIEF_EDITOR, EDITOR, AUTHOR).
- **Article Management**: Full CRUD operations with a rich text editor.
- **Ad System**: Manage dynamic advertisements across the site.
- **Profile Management**: Update biographic info and display names.
- **Sticky Notes**: Personal notes with a hybrid storage model:
  - **User-specific data** (content, color, categories, reminders): Syncs across all devices
  - **Device-specific data** (positions, sizes, visibility): Unique per device for optimal layout

## 📦 Project Structure

```text
bcn/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── (public)/          # Public pages
│   └── api/               # API routes
├── components/            # Reusable UI components
├── lib/                   # Shared utilities & Prisma client
├── prisma/               # Schema definitions & seed scripts
├── .github/workflows/    # CI/CD pipelines
└── public/               # Static assets (images, icons)
```

## 🔒 Security

- Password hashing with `bcryptjs`.
- Secure session-based authentication via NextAuth.
- Protected API routes and role-based permissions at the page level.
- Environment variable validation for production safety.

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. Contact the repository owner for access.
