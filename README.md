import os, textwrap, json, zipfile, pathlib, shutil, re, datetime
base = "/mnt/data/Villadelsolrms"
if os.path.exists(base):
    shutil.rmtree(base)
os.makedirs(base, exist_ok=True)

def w(path, content):
    full = os.path.join(base, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)

# Root files
w("README.md", textwrap.dedent("""\
# Villa del Sol RMS (Restaurant Management System)

Multi-branch restaurant management system (API + POS + KDS + QR ordering) built with **TypeScript**.

This repo is a **Docker-first** monorepo (pnpm + turbo).

## What’s included (MVP scaffold)
- **apps/api**: NestJS API (Prisma + Postgres + Redis + Socket.IO)
- **apps/pos-web**: Next.js POS PWA (placeholder UI + shared auth/token handling scaffold)
- **apps/kds-web**: Next.js KDS (live order feed via websockets scaffold)
- **apps/qr-web**: Next.js QR ordering (table token -> create order scaffold)
- **packages/db**: Prisma schema (multi-tenant + multi-branch + menu + orders + inventory + M-Pesa tables)
- **packages/shared**: shared TypeScript types + Zod validators

## Quick start (local)
### Prereqs
- Node.js 20+
- pnpm 9+
- Docker

### 1) Configure env
```bash
cp .env.example .env

