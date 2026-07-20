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

const computedHash = computePackageHash();

if (computedHash !== manifest.hash) {
  console.error('\n❌ @vonage/video-common hash check failed\n');
  console.error('   The source files (.ts/.tsx) do not match the committed manifest hash.');
  console.error('   This means libs/common source was modified without updating manifest.json.\n');
  console.error(`   Expected (manifest.json): ${manifest.hash || '(empty — never computed)'}`);
  console.error(`   Actual   (source):        ${computedHash}\n`);
  console.error('   To fix, run:\n');
  console.error('     yarn hash:update\n');
  console.error('   Then commit the updated manifest.json.\n');
  process.exit(1);
}

console.log(`\n✅ @vonage/video-common hash verified: ${computedHash}\n`);
process.exit(0);
