# pnpm-lock.yaml Fix

## Issue
The build is failing with:
```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date
```

This happens because new `package.json` files were added (apps/kds, apps/qr) after the lock file was generated.

## Solution

### Method 1: Regenerate Lock File Locally (Recommended)

Run the following commands in your terminal:

```bash
cd /path/to/villadelsolrms

# Option A: Delete and reinstall
rm pnpm-lock.yaml
pnpm install

# Option B: Update with pnpm
pnpm install --no-frozen-lockfile
```

Then commit the updated `pnpm-lock.yaml`:
```bash
git add pnpm-lock.yaml
git commit -m "chore: regenerate pnpm lock file for new apps"
git push
```

### Method 2: Using the Script

We've provided a Node.js script:

```bash
node scripts/regenerate-lockfile.js
```

Then commit the changes:
```bash
git add pnpm-lock.yaml
git commit -m "chore: regenerate pnpm lock file for new apps"
git push
```

### Method 3: Let Vercel Handle It

If deploying to Vercel, you can add this build environment variable:
- Set `PNPM_FLAGS` to `--no-frozen-lockfile` in Vercel Project Settings

However, it's better to commit the updated lock file.

## Why This Happens

When new workspaces (packages) are added to a pnpm monorepo, the lock file needs to be regenerated to:
1. Include all dependencies for the new workspaces
2. Ensure consistent dependency resolution
3. Lock specific versions for reproducible builds

## After Fixing

Once the lock file is regenerated, the build should succeed:
- The lock file will include entries for `apps/kds` and `apps/qr`
- All dependencies will be properly resolved
- Deployments will work without the frozen-lockfile error

## Files That Changed

New applications and packages that triggered this issue:
- `apps/kds/` - Kitchen Display System application
- `apps/qr/` - QR Code ordering application
- Updated `packages/shared/` with proper configuration
- All apps now have complete `package.json` files

All these need to be reflected in the lock file for proper installation.
