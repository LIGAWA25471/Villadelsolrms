# Verification Checklist

After running the lockfile fix, verify everything is set up correctly:

## ✅ Pre-Deployment Checklist

### 1. Lockfile Regeneration
```bash
# Verify you committed the updated lockfile
git log --oneline -- pnpm-lock.yaml | head -1

# Should show your recent commit:
# abc1234 chore: regenerate pnpm lockfile
```

### 2. Package Manager Pinning
```bash
# Verify pnpm version is pinned in root package.json
cat package.json | grep packageManager

# Should show:
# "packageManager": "pnpm@10.0.0"
```

### 3. NPM Configuration
```bash
# Verify .npmrc has package manager config
cat .npmrc | grep package-manager

# Should show:
# package-manager=pnpm@10.0.0
```

### 4. Local Build Test
```bash
# Clean install (simulates CI)
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Should succeed without errors
```

### 5. All Workspaces Present
```bash
# Verify all workspaces are recognized
pnpm ls -r --depth=0

# Should list:
# - apps/api
# - apps/pos
# - apps/kds
# - apps/qr
# - packages/database
# - packages/shared
```

### 6. Git Status Clean
```bash
# Verify all changes are committed
git status

# Should show "nothing to commit, working tree clean"
# EXCEPT any .env files (which should be in .gitignore)
```

## 🚀 After Pushing

### 1. Check Vercel Build
- Go to: https://vercel.com/dashboard
- Select your project
- Wait for the deployment to complete
- Should see **"Deployment successful"** ✅

### 2. Verify All Deployments
- **API** should be running
- **POS** should be accessible
- **KDS** should be accessible
- **QR** should be accessible

### 3. Check Logs
If build still fails, check Vercel logs for:
- `ERR_PNPM_OUTDATED_LOCKFILE` → lockfile wasn't updated
- `Module not found` → missing dependency in lockfile
- `ERR_MODULE_NOT_FOUND` → dependency not installed

## 🔧 If Build Still Fails

### Option 1: Verify Latest pnpm-lock.yaml is Pushed
```bash
git push --force-with-lease  # Only if needed
```

### Option 2: Clear Vercel Cache
In Vercel dashboard:
1. Go to Settings → Git
2. Click "Clear cache and redeploy"
3. Redeploy the latest commit

### Option 3: Manual Vercel Install Command
If all else fails, set Vercel install command to:
```bash
pnpm install --no-frozen-lockfile
```
(Not ideal, but this will make the build pass)

---

## ✨ Success Criteria

- [ ] `pnpm install` runs without errors locally
- [ ] All 6 workspaces install successfully
- [ ] `pnpm-lock.yaml` is updated and committed
- [ ] `package.json` has `"packageManager": "pnpm@10.0.0"`
- [ ] `.npmrc` has `package-manager=pnpm@10.0.0`
- [ ] Latest commit is pushed to GitHub
- [ ] Vercel build succeeds
- [ ] All 4 apps are deployed and accessible

Once all items are checked, the fix is complete! 🎉
