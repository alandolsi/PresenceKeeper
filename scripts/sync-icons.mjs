import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('.');
const sourceDir = resolve(root, 'node_modules', 'lucide-static', 'icons');
const targetDir = resolve(root, 'src', 'renderer', 'icons');

const icons = [
  'play.svg',
  'square.svg',
  'clock-3.svg',
  'calendar-clock.svg',
  'activity.svg',
  'logs.svg',
  'save.svg'
];

if (!existsSync(sourceDir)) {
  throw new Error(`Lucide source directory not found: ${sourceDir}`);
}

mkdirSync(targetDir, { recursive: true });

for (const icon of icons) {
  const from = resolve(sourceDir, icon);
  const to = resolve(targetDir, icon);
  if (!existsSync(from)) {
    throw new Error(`Missing icon file: ${from}`);
  }
  copyFileSync(from, to);
}

console.log(`Synced ${icons.length} Lucide icons to ${targetDir}`);
