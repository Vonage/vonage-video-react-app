/// <reference types='vitest' />
import { defineConfig, mergeConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dts from 'vite-plugin-dts';
import * as path from 'node:path';
import * as fs from 'node:fs';
import scanExternalPackages from './scripts/helpers/scanExternalPackages';

/**
 * Generates the public package outputs from the source folders.
 *
 * Examples:
 * - src/index.ts -> dist/index.js
 * - src/assertions/index.ts -> dist/assertions.js
 * - src/assertions/assertNotNil/index.ts -> dist/assertions/assertNotNil.js
 * - src/helpers/kebabToCamel.ts -> dist/helpers/kebabToCamel.js
 *
 * Files deeper than that are bundled as internal code, not exported directly.
 */
const sourceGroups = [
  {
    sourceRoot: 'src',
    rootEntryName: 'index',
    publicPrefix: '',
    alias: '@common',
  },
  {
    sourceRoot: 'srcBrowser',
    rootEntryName: 'web/index',
    publicPrefix: 'web',
    alias: '@web',
  },
  {
    sourceRoot: 'srcNode',
    rootEntryName: 'node/index',
    publicPrefix: 'node',
    alias: '@node',
  },
  {
    sourceRoot: 'test',
    rootEntryName: 'test/index',
    publicPrefix: 'test',
    alias: '@common-test',
  },
  {
    sourceRoot: 'testBrowser',
    rootEntryName: 'web/test/index',
    publicPrefix: 'web/test',
    alias: '@web-test',
  },
  {
    sourceRoot: 'testNode',
    rootEntryName: 'node/test/index',
    publicPrefix: 'node/test',
    alias: '@node-test',
  },
] as const satisfies readonly SourceGroup[];

// ─── Non-optional packages ─────────────────────────────────────
// These go into both "dependencies" AND "peerDependencies" (optional: false).
// Everything else detected by the scan is optional peer only.
const nonOptionalPackages = new Set([
  'zod',
  'resize-observer-polyfill',
  'status-code-enum',
  'ua-parser-js',
]);

const aliases = Object.fromEntries(
  sourceGroups.map(({ alias, sourceRoot }) => [alias, path.resolve(__dirname, sourceRoot)])
);

const externalPackages = scanExternalPackages({
  sourceRoots: sourceGroups.map(({ sourceRoot }) => path.resolve(__dirname, sourceRoot)),
  internalAliases: sourceGroups.map(({ alias }) => alias),
});

const libraryEntries = createLibraryEntries();

const baseConfig = defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/common',
  resolve: {
    alias: aliases,
  },
});

const buildConfig = defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
      compilerOptions: {
        composite: false,
      },
      entryRoot: __dirname,
      include: sourceGroups.map(({ sourceRoot }) => `${sourceRoot}/**/*`),
      outDir: 'dist',
      rollupTypes: false,
    }),
    {
      name: 'generate-dist-package',
      closeBundle() {
        const distDir = path.join(__dirname, 'dist');
        const monorepoRoot = path.resolve(__dirname, '../..');
        const nodeModulesDir = path.join(monorepoRoot, 'node_modules');

        // ─── Read source package.json ────────────────────────────────────
        const sourcePackageJsonPath = path.join(__dirname, 'package.json');
        const sourcePackageJson = JSON.parse(fs.readFileSync(sourcePackageJsonPath, 'utf-8'));

        // ─── Generate exports from the Rollup entry manifest ─────────────
        const generatedExports = generateExportsFromEntries(libraryEntries);

        // ─── Generate dependency fields from scanned externals ───────────
        const peerDependencies: Record<string, string> = {};
        const peerDependenciesMeta: Record<string, { optional: boolean }> = {};
        const dependencies: Record<string, string> = {};

        for (const packageName of [...externalPackages].sort()) {
          // Skip sub-path imports like "react/jsx-runtime" — covered by base package
          const isSubPathImport = !packageName.startsWith('@') && packageName.includes('/');
          if (isSubPathImport) continue;

          // Resolve version from node_modules
          const version = resolveInstalledVersion({ packageName, nodeModulesDir });
          if (!version) continue;

          const versionRange = `^${version}`;
          const isNonOptional = nonOptionalPackages.has(packageName);

          peerDependencies[packageName] = versionRange;
          peerDependenciesMeta[packageName] = { optional: !isNonOptional };

          if (isNonOptional) {
            dependencies[packageName] = versionRange;
          }
        }

        // ─── Assemble dist/package.json ──────────────────────────────────
        const distPackageJson = {
          name: sourcePackageJson.name,
          version: sourcePackageJson.version,
          type: sourcePackageJson.type,
          license: sourcePackageJson.license,
          sideEffects: sourcePackageJson.sideEffects,
          types: generatedExports['.']?.types ?? sourcePackageJson.types,
          main: sourcePackageJson.main,
          module: sourcePackageJson.module,
          exports: generatedExports,
          dependencies,
          peerDependencies,
          peerDependenciesMeta,
          publishConfig: sourcePackageJson.publishConfig,
        };

        fs.writeFileSync(
          path.join(distDir, 'package.json'),
          JSON.stringify(distPackageJson, null, 2) + '\n'
        );

        // ─── Copy LICENSE ────────────────────────────────────────────────
        const licenseSrcPath = path.resolve(monorepoRoot, 'LICENSE.MIT');
        fs.copyFileSync(licenseSrcPath, path.join(distDir, 'LICENSE'));

        // ─── Copy README and docs ───────────────────────────────────────
        const readmeSrcPath = path.join(__dirname, 'README.md');
        fs.copyFileSync(readmeSrcPath, path.join(distDir, 'README.md'));
      },
    },
  ],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false,
      },
    },
    lib: {
      entry: libraryEntries,
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName.replaceAll('$', '_')}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: isExternal,
      output: {
        chunkFileNames: '_chunks/[name]-[hash].js',
      },
    },
  },
  test: {
    name: 'common',
    watch: false,
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    include: ['{src,srcBrowser,srcNode,test,testBrowser,testNode}/**/*.{test,spec}.{ts,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './coverage',
      provider: 'v8' as const,
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}', 'srcBrowser/**/*.{ts,tsx}', 'srcNode/**/*.{ts,tsx}'],
      exclude: ['test/**', 'testBrowser/**', 'testNode/**', '**/index.ts'],
    },
  },
});

function createLibraryEntries() {
  return Object.fromEntries(
    sourceGroups.flatMap(({ sourceRoot, rootEntryName, publicPrefix }) =>
      createEntriesForSourceRoot({
        sourceRoot,
        rootEntryName,
        publicPrefix,
      })
    )
  );
}

function createEntriesForSourceRoot({
  sourceRoot,
  rootEntryName,
  publicPrefix,
}: CreateEntriesForSourceRootParams) {
  const rootDir = path.join(__dirname, sourceRoot);
  const entries: [string, string][] = [];

  const rootIndex = path.join(rootDir, 'index.ts');

  if (fs.existsSync(rootIndex)) {
    entries.push([rootEntryName, rootIndex]);
  }

  if (!fs.existsSync(rootDir)) {
    return entries;
  }

  for (const domainName of getChildDirectoryNames(rootDir)) {
    const domainPath = path.join(rootDir, domainName);
    const domainIndex = path.join(domainPath, 'index.ts');

    if (!fs.existsSync(domainIndex)) {
      continue;
    }

    entries.push([
      joinEntryName({
        publicPrefix,
        entryPath: path.join(domainName, 'index'),
      }),
      domainIndex,
    ]);

    const folderEntryNames = new Set<string>();

    for (const childName of getChildDirectoryNames(domainPath)) {
      const childIndex = path.join(domainPath, childName, 'index.ts');

      if (!fs.existsSync(childIndex)) {
        continue;
      }

      folderEntryNames.add(childName);

      entries.push([
        joinEntryName({
          publicPrefix,
          entryPath: path.join(domainName, childName, 'index'),
        }),
        childIndex,
      ]);
    }

    for (const fileName of getChildFileNames(domainPath)) {
      if (!isTsEntryFile(fileName)) {
        continue;
      }

      const entryName = path.parse(fileName).name;

      if (folderEntryNames.has(entryName)) {
        continue;
      }

      entries.push([
        joinEntryName({
          publicPrefix,
          entryPath: path.join(domainName, entryName),
        }),
        path.join(domainPath, fileName),
      ]);
    }
  }

  return entries;
}

function getChildDirectoryNames(dir: string) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function getChildFileNames(dir: string) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
}

function isExternal(id: string) {
  return (
    id.startsWith('node:') ||
    externalPackages.has(id) ||
    [...externalPackages].some((packageName) => id.startsWith(`${packageName}/`))
  );
}

function isTsEntryFile(fileName: string) {
  return (
    /\.(ts|tsx)$/.test(fileName) &&
    !/\.(test|spec)\.(ts|tsx)$/.test(fileName) &&
    fileName !== 'index.ts' &&
    fileName !== 'index.tsx' &&
    !fileName.endsWith('.types.ts') &&
    !fileName.endsWith('.types.tsx')
  );
}

function joinEntryName({ publicPrefix, entryPath }: JoinEntryNameParams) {
  return [publicPrefix, entryPath].filter(Boolean).join('/').replaceAll(path.sep, '/');
}

type SourceGroup = {
  sourceRoot: string;
  rootEntryName: string;
  publicPrefix: string;
  alias: string;
};

type CreateEntriesForSourceRootParams = {
  sourceRoot: string;
  rootEntryName: string;
  publicPrefix: string;
};

type JoinEntryNameParams = {
  publicPrefix: string;
  entryPath: string;
};

function generateExportsFromEntries(
  entries: Record<string, string>
): Record<string, { types: string; import: string; require: string }> {
  const exports: Record<string, { types: string; import: string; require: string }> = {};

  for (const [entryName, sourceFile] of Object.entries(entries).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    const normalizedEntryName = entryName.replaceAll(path.sep, '/');
    const declarationPath = path
      .relative(__dirname, sourceFile)
      .replace(/\.(ts|tsx)$/, '.d.ts')
      .replaceAll(path.sep, '/');

    const exportKey = (() => {
      if (normalizedEntryName === 'index') return '.';
      if (normalizedEntryName.endsWith('/index')) {
        return `./${normalizedEntryName.replace(/\/index$/, '')}`;
      }
      return `./${normalizedEntryName}`;
    })();

    exports[exportKey] = {
      types: `./${declarationPath}`,
      import: `./${normalizedEntryName}.js`,
      require: `./${normalizedEntryName}.cjs`,
    };
  }

  return exports;
}

function resolveInstalledVersion({
  packageName,
  nodeModulesDir,
}: {
  packageName: string;
  nodeModulesDir: string;
}): string | null {
  const packageJsonPath = path.join(nodeModulesDir, packageName, 'package.json');

  if (!fs.existsSync(packageJsonPath)) return null;

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')) as {
    version: string;
  };

  return packageJson.version ?? null;
}

export default mergeConfig(baseConfig, buildConfig);
