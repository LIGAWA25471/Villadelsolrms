# Fix: Regenerate pnpm-lock.yaml

## Problem
The `pnpm-lock.yaml` is outdated because new apps were added (`apps/kds`, `apps/qr`) but the lockfile wasn't regenerated. Vercel's frozen lockfile mode fails because `apps/kds/package.json` has dependencies not in the lockfile.

## Solution (5 minutes)

### Step 1: Ensure you have pnpm@10
```bash
corepack enable
corepack prepare pnpm@10.0.0 --activate
pnpm --version  # Should show 10.x.x
```

### Step 2: Install dependencies (regenerates lockfile)
From the **repo root** (same directory as `pnpm-workspace.yaml`):
```bash
pnpm install
```

This will:
- Validate all `package.json` files
- Regenerate `pnpm-lock.yaml` with all dependencies
- Install node_modules across the monorepo

### Step 3: Commit and push
```bash
git add pnpm-lock.yaml
git commit -m "chore: regenerate pnpm lockfile for apps/kds and apps/qr"
git push origin your-branch-name
```

### Step 4: Verify Vercel build succeeds
Push to GitHub and Vercel should now build successfully.

---

## Why This Happened

1. I created `apps/kds/package.json` and `apps/qr/package.json` with dependencies
2. The `pnpm-lock.yaml` was not regenerated to include these dependencies
3. Vercel runs `pnpm install --frozen-lockfile` in CI
4. When Vercel checks `apps/kds/package.json`, it finds dependencies not in the lockfile → build fails

## Prevention

The fix includes:
- ✅ `"packageManager": "pnpm@10.0.0"` in root `package.json` 
- ✅ `package-manager=pnpm@10.0.0` in `.npmrc`

This ensures everyone (local, CI, Vercel) uses the exact same pnpm version, preventing version mismatch issues.

---

## Troubleshooting

### "command not found: pnpm"
```bash
npm install -g corepack
corepack enable
corepack prepare pnpm@10.0.0 --activate
```

### "pnpm install" runs but lockfile still doesn't update
Delete `pnpm-lock.yaml` and retry:
```bash
rm pnpm-lock.yaml
pnpm install
```

### Tests pass locally but Vercel still fails
Make sure you pushed the **updated** `pnpm-lock.yaml`:
```bash
git log --oneline -- pnpm-lock.yaml | head -1
```
Should show your recent commit.

---

## Questions?

- The pnpm monorepo is configured in `pnpm-workspace.yaml`
- All workspaces are installed together: `pnpm install` from root handles all of them
- Never run `pnpm install` from individual app directories unless you know what you're doing
