const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Regenerating pnpm-lock.yaml...');
console.log('This will update the lock file to include all new packages.');

try {
  // Remove the current lock file
  const lockfilePath = path.join(__dirname, '..', 'pnpm-lock.yaml');
  if (fs.existsSync(lockfilePath)) {
    fs.unlinkSync(lockfilePath);
    console.log('✓ Removed old lock file');
  }

  // Install dependencies without frozen lockfile
  execSync('pnpm install --no-frozen-lockfile', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });

  console.log('✓ Lock file regenerated successfully!');
  console.log('✓ All dependencies installed!');
} catch (error) {
  console.error('✗ Error regenerating lock file:', error.message);
  process.exit(1);
}
