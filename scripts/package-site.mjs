/**
 * Zips dist/ into site-upload.zip for a manual upload through Hostinger's
 * File Manager (upload into public_html, then Extract). Run after a build:
 *
 *   npm run package
 *
 * Uses the tar built into Windows 10+ and macOS, or zip on Linux.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const out = join(root, 'site-upload.zip');

if (!existsSync(join(dist, 'index.html')) || !existsSync(join(dist, '.htaccess'))) {
  console.error('dist/ is missing or incomplete. Run "npm run build" first.');
  process.exit(1);
}

rmSync(out, { force: true });
if (process.platform === 'linux') {
  execFileSync('zip', ['-qr', out, '.'], { cwd: dist, stdio: 'inherit' });
} else {
  // On Windows use the system bsdtar; a Git Bash GNU tar on PATH cannot write zip.
  const tar =
    process.platform === 'win32'
      ? join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe')
      : 'tar';
  execFileSync(tar, ['-a', '-c', '-f', out, '.'], { cwd: dist, stdio: 'inherit' });
}

const mb = (statSync(out).size / 1024 / 1024).toFixed(1);
console.log(`Wrote site-upload.zip (${mb} MB). In hPanel File Manager: open public_html, upload it, then Extract.`);
