import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const extraArgs = process.argv.slice(2);
const hasPortFlag = extraArgs.some((arg) => arg === '--port' || arg.startsWith('--port='));
const viteArgs = hasPortFlag ? extraArgs : ['--port', '5174', ...extraArgs];

const localViteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
if (fs.existsSync(localViteBin)) {
  const child = spawn(process.execPath, [localViteBin, ...viteArgs], {
    cwd: rootDir,
    stdio: 'inherit'
  });
  child.on('exit', (code) => process.exit(code ?? 0));
} else {
  const localAppData =
    process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local');
  const buildDir = path.join(localAppData, 'kora-build');
  const buildViteBin = path.join(buildDir, 'node_modules', 'vite', 'bin', 'vite.js');

  if (!fs.existsSync(buildViteBin)) {
    console.error(
      `[kora dev] Vite wurde weder in "${rootDir}\\node_modules" noch in "${buildDir}\\node_modules" gefunden.`
    );
    console.error('[kora dev] Bitte zuerst "npm install" im Build-Verzeichnis ausführen.');
    process.exit(1);
  }

  const syncDirs = ['src', 'public'];
  const syncFiles = [
    'index.html',
    'package.json',
    'vite.config.ts',
    'tsconfig.json',
    'vitest.config.ts',
    'capacitor.config.ts',
    '.env.local'
  ];

  const copyFileSafe = (relPath) => {
    const srcPath = path.join(rootDir, relPath);
    const destPath = path.join(buildDir, relPath);
    try {
      if (fs.existsSync(srcPath)) {
        const stat = fs.statSync(srcPath);
        if (stat.isFile()) {
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          fs.copyFileSync(srcPath, destPath);
        }
      } else if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { force: true });
      }
    } catch {
      // Ignore transient editor lock errors; subsequent watch event will resync
    }
  };

  for (const rel of syncFiles) {
    copyFileSafe(rel);
  }
  for (const dir of syncDirs) {
    const srcSub = path.join(rootDir, dir);
    const destSub = path.join(buildDir, dir);
    if (fs.existsSync(srcSub)) {
      fs.cpSync(srcSub, destSub, { recursive: true, force: true });
    }
  }

  const watchers = [];
  for (const dir of syncDirs) {
    const watchPath = path.join(rootDir, dir);
    if (fs.existsSync(watchPath)) {
      const watcher = fs.watch(watchPath, { recursive: true }, (_event, filename) => {
        if (!filename) return;
        const normalized = path.join(dir, filename.toString());
        copyFileSafe(normalized);
      });
      watchers.push(watcher);
    }
  }

  const rootWatcher = fs.watch(rootDir, (_event, filename) => {
    if (!filename) return;
    const name = filename.toString();
    if (name === 'index.html' || name === 'vite.config.ts') {
      copyFileSafe(name);
    }
  });
  watchers.push(rootWatcher);

  console.log(`[kora dev] Live-Sync aktiv (${rootDir} -> ${buildDir})`);
  const child = spawn(process.execPath, [buildViteBin, ...viteArgs], {
    cwd: buildDir,
    stdio: 'inherit'
  });

  const cleanup = () => {
    for (const w of watchers) {
      try {
        w.close();
      } catch {
        // Ignore
      }
    }
  };

  process.on('SIGINT', () => {
    cleanup();
    child.kill('SIGINT');
  });
  process.on('SIGTERM', () => {
    cleanup();
    child.kill('SIGTERM');
  });
  child.on('exit', (code) => {
    cleanup();
    process.exit(code ?? 0);
  });
}
