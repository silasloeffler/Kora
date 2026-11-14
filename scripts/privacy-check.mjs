import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN_PATTERNS = [
  /^Data\//i,
  /^personal-data\//i,
  /^public\/personal-seed\.local\.json$/i,
  /\.local\.json$/i,
  /^technogym_workout_logger\.html$/i,
  /^Kora\.apk$/i,
  /^\.env(\..+)?$/i
];

const ALLOWED_EXCEPTIONS = [/^\.env\.example$/i];

export function isForbiddenPath(filePath) {
  const normalized = filePath.replace(/\\/g, '/').replace(/^"|"$/g, '').trim();
  if (!normalized) return false;
  if (ALLOWED_EXCEPTIONS.some((rx) => rx.test(normalized))) {
    return false;
  }
  return FORBIDDEN_PATTERNS.some((rx) => rx.test(normalized));
}

function runGit(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch {
    return '';
  }
}

function main() {
  const gitDirExists = fs.existsSync(path.join(process.cwd(), '.git'));
  if (!gitDirExists) {
    console.log('[privacy-check] No .git directory yet. Checking .gitignore rules...');
    const gitignore = fs.readFileSync(path.join(process.cwd(), '.gitignore'), 'utf8');
    const requiredRules = ['/Data/', '/personal-data/', '/public/personal-seed.local.json', '/technogym_workout_logger.html'];
    const missing = requiredRules.filter((r) => !gitignore.includes(r));
    if (missing.length > 0) {
      console.error('[privacy-check] Missing required .gitignore rules:', missing);
      process.exit(1);
    }
    console.log('[privacy-check] .gitignore rules verified.');
    return;
  }

  const tracked = runGit('git ls-files')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const statusLines = runGit('git status --porcelain')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).trim());

  const violations = [...new Set([...tracked, ...statusLines])].filter(isForbiddenPath);

  if (violations.length > 0) {
    console.error('[privacy-check] ERROR: Forbidden personal files detected in git tracked/staged/untracked status:');
    for (const v of violations) {
      console.error(`  - ${v}`);
    }
    process.exit(1);
  }

  console.log('[privacy-check] OK: No personal data files are tracked or exposed in Git.');
}

// Run when executed directly as a script
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main();
}
