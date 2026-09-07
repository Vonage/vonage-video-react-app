import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMMON_ROOT = path.resolve(__dirname, '..');

const SOURCE_DIRECTORIES = ['src', 'srcBrowser', 'srcNode', 'test', 'testBrowser', 'testNode'];

function walkTsFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];

  return fs.readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) return walkTsFiles(fullPath);
    if (/\.(ts|tsx)$/.test(entry.name)) return [fullPath];

    return [];
  });
}

/**
 * Computes a SHA-256 hash of all .ts/.tsx source files in the package.
 * Deterministic across environments — hashes committed source, not build output.
 */
function computePackageHash(rootDir: string = COMMON_ROOT): string {
  const allFiles: string[] = [];

  for (const dir of SOURCE_DIRECTORIES) {
    allFiles.push(...walkTsFiles(path.join(rootDir, dir)));
  }

  allFiles.sort((a, b) => {
    const relA = path.relative(rootDir, a);
    const relB = path.relative(rootDir, b);
    return relA.localeCompare(relB);
  });

  const hash = crypto.createHash('sha256');

  for (const filePath of allFiles) {
    const relativePath = path.relative(rootDir, filePath).replaceAll(path.sep, '/');
    hash.update(relativePath);
    hash.update(fs.readFileSync(filePath));
  }

  return hash.digest('hex');
}

export default computePackageHash;

const isRunDirectly =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isRunDirectly) {
  console.log(computePackageHash());
}
