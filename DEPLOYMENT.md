# Deployment Guide

## Prerequisites

- Node.js 18+ or 20+
- pnpm 9.x or 10.x
- Docker & Docker Compose (for local development)
- Supabase account with PostgreSQL database
- Git repository access

## Quick Start

### 1. Fix Lock File (If Needed)

```bash
pnpm install --no-frozen-lockfile
git add pnpm-lock.yaml
git commit -m "chore: update lock file"
git push
```

### 2. Environment Setup

Create `.env` files in each application:

**Root `.env`:**
```
DATABASE_URL=postgresql://user:password@db:5432/villadelsolrms
JWT_SECRET=your-secret-key-here
```

**apps/api/.env:**
```
DATABASE_URL=postgresql://user:password@db:5432/villadelsolrms
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h
PORT=3001
```

**apps/pos/.env.local:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

**apps/kds/.env.local:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

**apps/qr/.env.local:**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 3. Local Development

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed test data
pnpm db:seed

# Start all services
pnpm dev
```

Access:
- API: http://localhost:3001
- POS: http://localhost:3000
- KDS: http://localhost:3002
- QR: http://localhost:3003

### 4. Docker Deployment

```bash
# Build all images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Vercel Deployment

### Step 1: Configure Repository

Connect your GitHub repository to Vercel with these settings:

**Root Directory:** `.` (root of monorepo)
**Framework:** Other

### Step 2: Environment Variables

Set these in Vercel Project Settings → Environment Variables:

```
DATABASE_URL=your-supabase-url
JWT_SECRET=your-secret
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_WS_URL=wss://your-api-domain.com
```

### Step 3: Build Settings

**Build Command:**
```bash
pnpm install --no-frozen-lockfile && pnpm build
```

**Output Directory:** `apps/pos/.next`

**Install Command:**
```bash
pnpm install --no-frozen-lockfile
```

### Step 4: Deploy

Push to your repository and Vercel will automatically deploy.

## Troubleshooting

### Lock File Errors

**Error:** `ERR_PNPM_OUTDATED_LOCKFILE`

**Solution:**
```bash
rm pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "fix: regenerate lock file"
git push
```

### Database Connection Errors

**Error:** `Can't reach database server`

**Solutions:**
1. Verify DATABASE_URL environment variable
2. Check Supabase connection string format
3. Ensure IP whitelist includes your deployment server
4. Test connection locally: `psql $DATABASE_URL -c "SELECT 1"`

### Build Timeout

**Solution:** Increase timeout in Vercel settings to 3600s

### Missing Dependencies

**Error:** `Module not found: Cannot find module 'xyz'`

**Solution:**
```bash
pnpm install --no-frozen-lockfile
pnpm build
```

### WebSocket Connection Issues

**Error:** `WebSocket connection failed`

**Solutions:**
1. Verify `NEXT_PUBLIC_WS_URL` is set correctly
2. Ensure API server is running
3. Check CORS and WebSocket configurations in NestJS

## Performance Optimization

1. **Enable caching:**
   - Set `PNPM_HOME` environment variable
   - Use Vercel's smart caching

2. **Database:**
   - Add indexes on frequently queried columns
   - Enable read replicas for read-heavy operations

3. **Frontend:**
   - Enable image optimization in Next.js
   - Use SWR for caching
   - Implement lazy loading

## Monitoring & Logs

### View API Logs
```bash
docker-compose logs -f api
```

### View Database Logs
```bash
docker-compose logs -f db
```

### Monitor in Production
- Use Sentry for error tracking
- Enable CloudFlare analytics
- Monitor Supabase dashboard

## Backup & Recovery

### Database Backup
```bash
# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### Automated Backups
- Enable Supabase automated backups (7 days retention)
- Configure weekly backups to S3

## Security Checklist

- [ ] Change default credentials
- [ ] Enable 2FA for admin accounts
- [ ] Set strong JWT secret
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Enable database encryption
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Use environment variables for secrets
- [ ] Regular security updates

## Scaling Considerations

1. **Horizontal Scaling:**
   - Use load balancer for API
   - Deploy multiple instances of each service
   - Use sticky sessions for WebSocket

2. **Database Scaling:**
   - Connection pooling with PgBouncer
   - Read replicas for analytics
   - Archive old data

3. **Caching:**
   - Redis for session management
   - Cache menu items
   - Cache branch data

## Support

For issues, check:
1. [LOCKFILE_FIX.md](./LOCKFILE_FIX.md) - Lock file problems
2. [SETUP.md](./SETUP.md) - Setup issues
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
4. [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Feature documentation
