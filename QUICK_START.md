# Quick Start Guide

## 1️⃣ Fix the Build (One-Time, 5 minutes)

Run this **once** from the repo root to regenerate the lockfile:

```bash
# Enable corepack and use pnpm@10
corepack enable
corepack prepare pnpm@10.0.0 --activate

# Regenerate lockfile
pnpm install

# Commit and push
git add pnpm-lock.yaml
git commit -m "chore: regenerate pnpm lockfile"
git push
```

Vercel will now build successfully. ✅

---

## 2️⃣ Local Development

```bash
# Install all workspace dependencies
pnpm install

# Start all services in parallel
pnpm dev
```

Services will start on:
- **API**: http://localhost:3001
- **POS**: http://localhost:3000
- **KDS**: http://localhost:3002
- **QR**: http://localhost:3003

---

## 3️⃣ Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed demo data (optional)
cd packages/database
pnpm exec prisma db seed
```

Demo credentials:
```
waiter@example.com / password123
chef@example.com / password123
manager@example.com / password123
cashier@example.com / password123
```

---

## 4️⃣ Build for Production

```bash
# Build all packages and apps
pnpm build

# Output will be in:
# - apps/api/dist
# - apps/pos/.next
# - apps/kds/.next
# - apps/qr/.next
```

---

## Project Structure

```
villadelsolrms/
├── apps/                    # Web applications
│   ├── api/                # NestJS backend
│   ├── pos/                # POS staff interface
│   ├── kds/                # Kitchen display system
│   └── qr/                 # Customer QR ordering
├── packages/               # Shared code
│   ├── database/           # Prisma schema & migrations
│   └── shared/             # TS types & utilities
├── pnpm-workspace.yaml     # Workspace config
├── turbo.json              # Build orchestration
└── docker-compose.yml      # Local dev containers
```

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start all services locally |
| `pnpm build` | Build all packages for production |
| `pnpm lint` | Run ESLint across all projects |
| `pnpm type-check` | Check TypeScript types |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:generate` | Regenerate Prisma client |

---

## Need Help?

- **Build failing on Vercel?** → See [FIX_LOCKFILE.md](./FIX_LOCKFILE.md)
- **Local setup issues?** → See [SETUP.md](./SETUP.md)
- **Architecture questions?** → See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Deployment guide?** → See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Key Technologies

- **Backend:** NestJS 10 + Node.js
- **Frontend:** Next.js 15 + React 19
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma 5
- **Real-time:** Socket.io + WebSockets
- **Monorepo:** pnpm workspaces + Turborepo
- **Deployment:** Docker + Vercel
