import * as fs from 'node:fs';
import * as path from 'node:path';
import * as child_process from 'node:child_process';
import { fileURLToPath } from 'node:url';
import computeDistHash from './computeDistHash';
import { validateVersionSync, validateChannelFormat } from './helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const MONOREPO_ROOT = path.resolve(ROOT, '../..');
const MANIFEST_PATH = path.join(ROOT, 'manifest.json');
const PACKAGE_JSON_PATH = path.join(ROOT, 'package.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));

validateVersionSync({ manifestVersion: manifest.version, packageVersion: packageJson.version });
validateChannelFormat({ version: manifest.version, channel: manifest.channel });

console.log('Building package...');
child_process.execSync('npx nx run common:build', {
  cwd: MONOREPO_ROOT,
  stdio: 'inherit',
});

const distPath = path.join(ROOT, 'dist');
const newHash = computeDistHash(distPath);
const oldHash = manifest.hash;

console.log(`Old hash: ${oldHash || '(empty)'}`);
console.log(`New hash: ${newHash}`);

manifest.hash = newHash;
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

console.log('manifest.json updated. Commit manifest.json.');
