import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import computeDistHash from './computeDistHash';
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

const distPath = path.join(ROOT, 'dist');

if (!fs.existsSync(distPath)) {
  console.error('\n❌ @vonage/video-common hash check failed\n');
  console.error('   dist/ directory not found.');
  console.error('   The package must be built before verifying the hash.\n');
  console.error('   Run:\n');
  console.error('     yarn build common\n');
  process.exit(1);
}

const computedHash = computeDistHash(distPath);

if (computedHash !== manifest.hash) {
  console.error('\n❌ @vonage/video-common hash check failed\n');
  console.error('   The built output (dist/) does not match the committed manifest hash.');
  console.error('   This means libs/common source was modified without updating manifest.json.\n');
  console.error(`   Expected (manifest.json): ${manifest.hash || '(empty — never computed)'}`);
  console.error(`   Actual   (dist/):         ${computedHash}\n`);
  console.error('   To fix, run:\n');
  console.error('     yarn common:hash:update\n');
  console.error('   Then commit the updated manifest.json.\n');
  process.exit(1);
}

console.log(`\n✅ @vonage/video-common hash verified: ${computedHash}\n`);
process.exit(0);
