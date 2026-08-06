import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const browserDist = process.env.PWA_DIST_DIR
    ? resolve(process.env.PWA_DIST_DIR)
    : resolve(projectRoot, 'dist', 'my-house-pwa', 'browser');
const packageJson = JSON.parse(
    await readFile(resolve(projectRoot, 'package.json'), 'utf8')
);
const version = process.env.LIPARIOS_VERSION || packageJson.version;

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Versione PWA non valida: ${version}`);
}

const builtAt = new Date().toISOString();
const ngswPath = resolve(browserDist, 'ngsw.json');
const versionPath = resolve(browserDist, 'pwa-version.json');
const ngsw = JSON.parse(await readFile(ngswPath, 'utf8'));

ngsw.appData = {
    ...(ngsw.appData ?? {}),
    version,
    builtAt
};

await writeFile(ngswPath, `${JSON.stringify(ngsw, null, 2)}\n`);
await writeFile(
    versionPath,
    `${JSON.stringify({ version, builtAt }, null, 2)}\n`
);

console.log(`Build PWA marcata come LipariOS ${version}`);
