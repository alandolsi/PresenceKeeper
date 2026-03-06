import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pngToIco from 'png-to-ico';

const projectRoot = resolve('.');
const sourcePng = resolve(projectRoot, 'src', 'PresenceKeeper.png');
const outPng = resolve(projectRoot, 'build', 'icon-256.png');
const outIco = resolve(projectRoot, 'build', 'icon.ico');

if (!existsSync(sourcePng)) {
  throw new Error(`Source PNG not found: ${sourcePng}`);
}

copyFileSync(sourcePng, outPng);
const icoBuffer = await pngToIco(readFileSync(sourcePng));
writeFileSync(outIco, icoBuffer);

console.log(`Generated ${outIco}`);
