import * as fs from 'node:fs';
import * as path from 'node:path';

const IMPORT_REGEX =
  /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]|import\(['"]([^'"]+)['"]\)|require\(['"]([^'"]+)['"]\)/g;

type ScanExternalPackagesParams = {
  sourceRoots: string[];
  internalAliases: string[];
};

function scanExternalPackages({
  sourceRoots,
  internalAliases,
}: ScanExternalPackagesParams): Set<string> {
  const packages = new Set<string>();

  for (const sourceRoot of sourceRoots) {
    for (const filePath of walkTsFiles(sourceRoot)) {
      const content = fs.readFileSync(filePath, 'utf-8');

      for (const match of content.matchAll(IMPORT_REGEX)) {
        const specifier = match[1] || match[2] || match[3];
        const packageName = getPackageName({ specifier, internalAliases });

        if (packageName) {
          packages.add(packageName);
        }
      }
    }
  }

  return packages;
}

function walkTsFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walkTsFiles(fullPath);
    }

    if (!entry.isFile() || !/\.(ts|tsx)$/.test(entry.name)) {
      return [];
    }

    if (/\.(spec|test)\.(ts|tsx)$/.test(entry.name)) {
      return [];
    }

    return [fullPath];
  });
}

function getPackageName({
  specifier,
  internalAliases,
}: {
  specifier: string;
  internalAliases: string[];
}): string | null {
  const isInternal =
    specifier.startsWith('.') ||
    specifier.startsWith('/') ||
    specifier.startsWith('node:') ||
    internalAliases.some((alias) => specifier === alias || specifier.startsWith(`${alias}/`));

  if (isInternal) return null;

  if (specifier.startsWith('@')) {
    const [scope, name] = specifier.split('/');
    return scope && name ? `${scope}/${name}` : null;
  }

  return specifier.split('/')[0] ?? null;
}

export default scanExternalPackages;
