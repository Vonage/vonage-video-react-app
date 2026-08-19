import * as fs from 'node:fs';
import * as path from 'node:path';
import * as https from 'node:https';
import * as child_process from 'node:child_process';
import { fileURLToPath } from 'node:url';
import computePackageHash from './computePackageHash';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const TARBALL_DIR = path.join(ROOT, 'tarball');
const MANIFEST_PATH = path.join(ROOT, 'manifest.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
const { version, hash: localHash } = manifest;
const PACKAGE_NAME = '@vonage/video-common';
const REGISTRY = 'https://npm.pkg.github.com';

if (fs.existsSync(TARBALL_DIR)) {
  fs.rmSync(TARBALL_DIR, { recursive: true, force: true });
}
fs.mkdirSync(TARBALL_DIR, { recursive: true });

function runCommand(command: string): { stdout: string; exitCode: number } {
  try {
    const stdout = child_process.execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, exitCode: 0 };
  } catch (error: unknown) {
    const execError = error as { stdout?: string; status?: number };
    return { stdout: execError.stdout ?? '', exitCode: execError.status ?? 1 };
  }
}

function downloadFile(args: { url: string; destination: string }): Promise<void> {
  const { url, destination } = args;
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', reject);
  });
}

async function main(): Promise<void> {
  const viewResult = runCommand(
    `npm view ${PACKAGE_NAME}@${version} dist.tarball --registry ${REGISTRY} --json`
  );

  const versionNotFound = viewResult.exitCode !== 0 || !viewResult.stdout.trim();

  if (versionNotFound) {
    console.log(`Version ${version} not yet published — safe to publish.`);
    process.exit(2);
  }

  const tarballUrl: string = JSON.parse(viewResult.stdout.trim());
  const tarballPath = path.join(TARBALL_DIR, `${version}.tgz`);
  const extractPath = path.join(TARBALL_DIR, version);

  console.log(`Downloading tarball from ${tarballUrl}...`);
  await downloadFile({ url: tarballUrl, destination: tarballPath });

  fs.mkdirSync(extractPath, { recursive: true });
  child_process.execSync(`tar -xzf "${tarballPath}" -C "${extractPath}"`);

  const packageDir = path.join(extractPath, 'package');
  const registryHash = computePackageHash(packageDir);

  if (registryHash === localHash) {
    console.log(`Registry version ${version} matches local manifest hash — already published.`);
    process.exit(0);
  }

  console.error(`Version ${version} exists in registry with different content.`);
  console.error(`  Registry hash: ${registryHash}`);
  console.error(`  Local hash:    ${localHash}`);
  console.error('Bump the version before publishing.');
  process.exit(1);
}

main();
