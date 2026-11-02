import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import scanExternalPackages from './helpers/scanExternalPackages';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');

const sourceGroups = [
  { sourceRoot: 'src', alias: '@common' },
  { sourceRoot: 'web', alias: '@web' },
  { sourceRoot: 'node', alias: '@node' },
  { sourceRoot: 'test', alias: '@common-test' },
  { sourceRoot: 'web-test', alias: '@web-test' },
  { sourceRoot: 'node-test', alias: '@node-test' },
];

const packages = scanExternalPackages({
  sourceRoots: sourceGroups.map(({ sourceRoot }) => path.join(ROOT, sourceRoot)),
  internalAliases: sourceGroups.map(({ alias }) => alias),
});

const sorted = [...packages].sort();

console.log(`\nExternal packages (${sorted.length}):\n`);

for (const packageName of sorted) {
  console.log(`  ${packageName}`);
}

console.log('');
