import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import computePackageHash from './computePackageHash';
import { validateVersionSync, validateChannelFormat } from './helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'manifest.json');
const PACKAGE_JSON_PATH = path.join(ROOT, 'package.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));

validateVersionSync({ manifestVersion: manifest.version, packageVersion: packageJson.version });
validateChannelFormat({ version: manifest.version, channel: manifest.channel });

const newHash = computePackageHash();
const oldHash = manifest.hash;

console.log(`Old hash: ${oldHash || '(empty)'}`);
console.log(`New hash: ${newHash}`);

manifest.hash = newHash;
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

console.log('manifest.json updated. Commit manifest.json.');
console.log(
  '\nReminder: ensure your branch is up-to-date with the target branch before running this script,'
);
console.log(
  'CI could fail if the target branch has newer libs/common changes that are not in your branch yet.'
);
