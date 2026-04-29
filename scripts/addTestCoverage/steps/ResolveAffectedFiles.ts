import { execFile as execFileCallback } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import { basename, extname, relative, resolve } from 'node:path';
import { promisify } from 'node:util';
import type { PipelineContext, StepExecutionResult, TestScope } from '../types';

const execFile = promisify(execFileCallback);

async function resolveAffectedFiles(context: PipelineContext): Promise<StepExecutionResult> {
  if (!context.testScope) {
    throw new Error('Test scope must be resolved before resolving affected files.');
  }

  const rootDirectory = process.cwd();
  const rawFiles = await collectRawFiles({ testScope: context.testScope, rootDirectory });
  const normalizedFiles = normalizeFilePaths({ rawFiles, rootDirectory });
  const testableFiles = removeNonTestableFiles(normalizedFiles);
  const excludedFiles = normalizedFiles.filter((file) => !testableFiles.includes(file));

  if (testableFiles.length === 0) {
    throw new Error('No testable files found for the selected test scope.');
  }

  context.affectedFiles = testableFiles;

  return {
    inputSummary: JSON.stringify({ testScope: context.testScope }, null, 2),
    outputSummary: JSON.stringify(
      {
        totalFilesCollected: normalizedFiles.length,
        excludedFileCount: excludedFiles.length,
        excludedFiles,
        testableFileCount: testableFiles.length,
        testableFiles,
      },
      null,
      2
    ),
  };
}

type CollectRawFilesArgs = {
  testScope: TestScope;
  rootDirectory: string;
};

async function collectRawFiles(args: CollectRawFilesArgs): Promise<string[]> {
  const { testScope, rootDirectory } = args;

  if (testScope.type === 'last-commit') {
    return collectFilesFromLastCommit(rootDirectory);
  }

  if (testScope.type === 'working-tree') {
    return collectFilesFromWorkingTree(rootDirectory);
  }

  return collectFilesFromPath({ inputPath: testScope.path, rootDirectory });
}

async function collectFilesFromLastCommit(rootDirectory: string): Promise<string[]> {
  const { stdout: diffOutput } = await execFile(
    'git',
    ['diff', '--name-only', '--diff-filter=ACMR', 'HEAD~1', 'HEAD'],
    { cwd: rootDirectory }
  );

  return splitGitOutput(diffOutput);
}

async function collectFilesFromWorkingTree(rootDirectory: string): Promise<string[]> {
  const { stdout: stagedOutput } = await execFile(
    'git',
    ['diff', '--name-only', '--diff-filter=ACMR', '--cached'],
    { cwd: rootDirectory }
  );

  const { stdout: unstagedOutput } = await execFile(
    'git',
    ['diff', '--name-only', '--diff-filter=ACMR'],
    { cwd: rootDirectory }
  );

  const stagedFiles = splitGitOutput(stagedOutput);
  const unstagedFiles = splitGitOutput(unstagedOutput);
  const uniqueFiles = [...new Set([...stagedFiles, ...unstagedFiles])];

  return uniqueFiles;
}

type CollectFilesFromPathArgs = {
  inputPath: string;
  rootDirectory: string;
};

async function collectFilesFromPath(args: CollectFilesFromPathArgs): Promise<string[]> {
  const { inputPath, rootDirectory } = args;
  const absolutePath = resolve(rootDirectory, inputPath);
  const pathStat = await stat(absolutePath);

  if (pathStat.isFile()) {
    return [absolutePath];
  }

  if (pathStat.isDirectory()) {
    return collectFilesRecursively(absolutePath);
  }

  throw new Error(`Path "${inputPath}" is neither a file nor a directory.`);
}

async function collectFilesRecursively(directoryPath: string): Promise<string[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const collectedFiles: string[] = [];

  for (const entry of entries) {
    const entryPath = resolve(directoryPath, entry.name);

    if (entry.isFile()) {
      collectedFiles.push(entryPath);
    } else if (entry.isDirectory()) {
      const nestedFiles = await collectFilesRecursively(entryPath);
      collectedFiles.push(...nestedFiles);
    }
  }

  return collectedFiles;
}

function splitGitOutput(gitOutput: string): string[] {
  return gitOutput
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

type NormalizeFilePathsArgs = {
  rawFiles: string[];
  rootDirectory: string;
};

function normalizeFilePaths(args: NormalizeFilePathsArgs): string[] {
  const { rawFiles, rootDirectory } = args;

  return rawFiles.map((filePath) => {
    if (filePath.startsWith('/')) {
      return relative(rootDirectory, filePath);
    }

    return filePath;
  });
}

const NON_TESTABLE_EXTENSIONS = new Set([
  // Images
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.webp',
  '.bmp',
  '.tiff',
  '.avif',

  // Fonts
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.eot',

  // Audio / Video
  '.mp3',
  '.mp4',
  '.wav',
  '.ogg',
  '.webm',
  '.avi',
  '.mov',

  // Documents / Data
  '.md',
  '.mdx',
  '.txt',
  '.pdf',
  '.csv',
  '.json',
  '.yaml',
  '.yml',
  '.toml',
  '.xml',

  // Config / Tooling
  '.env',
  '.editorconfig',
  '.gitignore',
  '.gitattributes',
  '.npmignore',
  '.npmrc',
  '.nvmrc',
  '.prettierrc',
  '.prettierignore',
  '.eslintignore',
  '.dockerignore',
  '.browserslistrc',

  // Lock files / Manifests
  '.lock',

  // Stylesheets (not unit-testable)
  '.css',

  // Build artifacts / Maps
  '.map',
  '.d.ts',

  // Certificates / Keys
  '.pem',
  '.crt',
  '.key',

  // Archives
  '.zip',
  '.tar',
  '.gz',
  '.tgz',
]);

const NON_TESTABLE_FILENAMES = new Set([
  'license',
  'licence',
  'changelog',
  'changes',
  'authors',
  'contributors',
  'readme',
  'readme.md',
  'contributing',
  'contributing.md',
  'code_of_conduct',
  'code_of_conduct.md',
  'dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  'makefile',
  'procfile',
  '.gitkeep',
  '.ds_store',
  'thumbs.db',
]);

function removeNonTestableFiles(filePaths: string[]): string[] {
  return filePaths.filter((filePath) => {
    const extension = extname(filePath).toLowerCase();
    const fileName = basename(filePath).toLowerCase();

    if (NON_TESTABLE_EXTENSIONS.has(extension)) return false;
    if (NON_TESTABLE_FILENAMES.has(fileName)) return false;
    if (fileName.startsWith('.') && extension === '') return false;

    return true;
  });
}

export default resolveAffectedFiles;
