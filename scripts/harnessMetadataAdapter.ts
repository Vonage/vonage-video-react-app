#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

type ProjectName =
  | 'backend'
  | 'frontend'
  | 'integration-tests'
  | 'api'
  | 'core'
  | 'ui'
  | 'common'
  | 'unknown';

type MetadataRequest = {
  filePath: string;
  projectName: ProjectName;
  targetMode: 'whole-file' | 'current-changes';
  coverageThreshold: number;
  repositoryRules: {
    testInstructionsFile: string;
    copilotInstructionsFile: string;
  };
};

type MetadataResponse = {
  targetFilePath: string;
  suggestedTestFilePaths: string[];
  recommendedCoverageCommand: string;
  recommendedTestCommand: string;
  behaviorsToTest: string[];
  blockers?: string[];
};

function main() {
  const [, , requestPath, responsePath] = process.argv;

  if (!requestPath || !responsePath) {
    console.error('Usage: npx tsx scripts/harnessMetadataAdapter.ts <requestFile> <responseFile>');
    process.exit(1);
  }

  const request = JSON.parse(fs.readFileSync(requestPath, 'utf-8')) as MetadataRequest;
  const suggestedTestFilePaths = findSuggestedTestFiles(request.filePath, request.projectName);

  const response: MetadataResponse = {
    targetFilePath: request.filePath,
    suggestedTestFilePaths,
    recommendedCoverageCommand: buildCoverageCommand({
      projectName: request.projectName,
      suggestedTestFilePaths,
    }),
    recommendedTestCommand: buildTestCommand({
      projectName: request.projectName,
      suggestedTestFilePaths,
    }),
    behaviorsToTest: buildBehaviorHints(request.filePath),
    blockers: request.projectName === 'integration-tests' ? ['integration-tests-no-file-coverage-support'] : [],
  };

  fs.writeFileSync(responsePath, JSON.stringify(response, null, 2), 'utf-8');
}

function findSuggestedTestFiles(filePath: string, projectName: ProjectName): string[] {
  const candidateSet = new Set<string>();

  const extension = path.extname(filePath);
  const withoutExtension = filePath.slice(0, filePath.length - extension.length);

  candidateSet.add(`${withoutExtension}.test.ts`);
  candidateSet.add(`${withoutExtension}.test.tsx`);
  candidateSet.add(`${withoutExtension}.spec.ts`);
  candidateSet.add(`${withoutExtension}.spec.tsx`);

  if (projectName === 'backend') {
    const backendRelativePath = filePath.replace(/^backend\//, '');
    candidateSet.add(`backend/tests/${path.basename(withoutExtension)}.test.ts`);
    candidateSet.add(`backend/tests/${backendRelativePath.replace(/\.[jt]sx?$/, '.test.ts')}`);
  }

  if (projectName === 'api' || projectName === 'core' || projectName === 'ui' || projectName === 'common') {
    const libraryRelativePath = filePath.replace(/^libs\/(api|core|ui|common)\//, '');
    candidateSet.add(`libs/${projectName}/${libraryRelativePath.replace(/\.[jt]sx?$/, '.test.ts')}`);
    candidateSet.add(`libs/${projectName}/${libraryRelativePath.replace(/\.[jt]sx?$/, '.test.tsx')}`);
  }

  const existingFiles = runCommandCapture('git ls-files')
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);

  const existingSet = new Set(existingFiles);

  const matched = Array.from(candidateSet)
    .map((candidate) => candidate.replace(/\\/g, '/'))
    .filter((candidate) => existingSet.has(candidate));

  if (matched.length > 0) {
    return matched;
  }

  return [];
}

function buildCoverageCommand(args: {
  projectName: ProjectName;
  suggestedTestFilePaths: string[];
}): string {
  const { projectName, suggestedTestFilePaths } = args;
  const [firstTest] = suggestedTestFilePaths;
  const normalizedTestPath = normalizeTestPathForProject({
    projectName,
    testFilePath: firstTest,
  });

  if (projectName === 'backend') {
    if (firstTest) {
      return `yarn nx test backend --configuration=coverage --testPathPattern=${shellQuote(firstTest)}`;
    }
    return 'yarn nx test backend --configuration=coverage';
  }

  if (projectName === 'frontend') {
    if (firstTest) {
      return `vitest --root frontend --config vite.config.ts --reporter=verbose --coverage --bail=1 --run ${shellQuote(firstTest)}`;
    }
    return 'yarn nx test frontend --configuration=coverage';
  }

  if (projectName === 'api' || projectName === 'core' || projectName === 'ui' || projectName === 'common') {
    if (normalizedTestPath) {
      return `yarn nx test ${projectName} --coverage --run ${shellQuote(normalizedTestPath)}`;
    }
    return `yarn nx test ${projectName} --coverage`;
  }

  return 'echo "coverage-not-supported-for-project"';
}

function buildTestCommand(args: {
  projectName: ProjectName;
  suggestedTestFilePaths: string[];
}): string {
  const { projectName, suggestedTestFilePaths } = args;
  const [firstTest] = suggestedTestFilePaths;
  const normalizedTestPath = normalizeTestPathForProject({
    projectName,
    testFilePath: firstTest,
  });

  if (projectName === 'backend') {
    if (firstTest) return `yarn nx test backend --testPathPattern=${shellQuote(firstTest)}`;
    return 'yarn nx test backend';
  }

  if (projectName === 'frontend') {
    if (firstTest) {
      return `vitest --root frontend --config vite.config.ts --reporter=verbose --no-coverage --bail=1 --run ${shellQuote(firstTest)}`;
    }
    return 'yarn nx test frontend';
  }

  if (projectName === 'api' || projectName === 'core' || projectName === 'ui' || projectName === 'common') {
    if (normalizedTestPath) return `yarn nx test ${projectName} --run ${shellQuote(normalizedTestPath)}`;
    return `yarn nx test ${projectName}`;
  }

  return 'echo "test-command-not-supported-for-project"';
}

function buildBehaviorHints(filePath: string): string[] {
  return [
    `verify-main-behavior-for-${path.basename(filePath)}`,
    'prefer-high-value-scenarios-over-permutation-heavy-tests',
    'avoid-overmocking-and-prioritize-real-functionality-assertions',
  ];
}

function runCommandCapture(command: string): string {
  return execSync(command, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
    env: process.env,
  });
}

function normalizeTestPathForProject(args: {
  projectName: ProjectName;
  testFilePath?: string;
}): string | null {
  const { projectName, testFilePath } = args;
  if (!testFilePath) return null;

  if (projectName === 'api' || projectName === 'core' || projectName === 'ui' || projectName === 'common') {
    return testFilePath.replace(new RegExp(`^libs/${projectName}/`), '');
  }

  if (projectName === 'backend') {
    return testFilePath.replace(/^backend\//, '');
  }

  if (projectName === 'frontend') {
    return testFilePath.replace(/^frontend\//, '');
  }

  return testFilePath;
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

main();
