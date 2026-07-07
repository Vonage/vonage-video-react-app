import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DIST_PATH = path.resolve(__dirname, '../dist');

function walkDirectory(dirPath: string): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkDirectory(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function computeDistHash(dirPath: string = DEFAULT_DIST_PATH): string {
  const allFiles = walkDirectory(dirPath).sort();
  const hash = crypto.createHash('sha256');

  for (const filePath of allFiles) {
    hash.update(fs.readFileSync(filePath));
  }

  return hash.digest('hex');
}

export default computeDistHash;

// CLI: npx tsx scripts/computeDistHash.ts [optional-path]
const isRunDirectly =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === path.resolve(__filename);

if (isRunDirectly) {
  const targetPath = process.argv[2] ?? DEFAULT_DIST_PATH;
  console.log(computeDistHash(targetPath));
}
