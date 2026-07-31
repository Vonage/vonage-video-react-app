#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const DEFAULT_PROVIDER: AdapterProvider = 'deterministic';
const DEFAULT_MAX_RETRIES = 10;
const COPILOT_TIMEOUT_MILLISECONDS = 120_000;
const DEFAULT_PROMPT_TEMPLATE_PATH = 'scripts/harnessMetadataPrompt.md';

type AdapterProvider = 'deterministic' | 'gh-copilot';
type AdapterStrategy = 'deterministic-first' | 'deterministic-then-copilot' | 'copilot-first';

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

type CliOptions = {
  provider: AdapterProvider;
  strategy: AdapterStrategy;
  maxRetries: number;
  promptTemplatePath: string;
  requestPath: string;
  responsePath: string;
};

type ParseValidationResult =
  | {
      success: true;
      data: MetadataResponse;
    }
  | {
      success: false;
      errorMessage: string;
    };

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  const request = JSON.parse(fs.readFileSync(options.requestPath, 'utf-8')) as MetadataRequest;

  const response =
    options.provider === 'gh-copilot'
      ? await buildCopilotResponse({ request, options })
      : buildDeterministicResponse(request);

  fs.writeFileSync(options.responsePath, JSON.stringify(response, null, 2), 'utf-8');
}

function parseCliOptions(argumentsList: string[]): CliOptions {
  const optionsRecord: Record<string, string> = {};
  const positionalArguments: string[] = [];

  let index = 0;
  while (index < argumentsList.length) {
    const current = argumentsList[index];

    if (!current.startsWith('--')) {
      positionalArguments.push(current);
      index += 1;
      continue;
    }

    const optionName = current.replace(/^--/, '');
    const next = argumentsList[index + 1];
    const hasValue = !!next && !next.startsWith('--');

    if (!hasValue) {
      throw new Error(`Missing value for option --${optionName}.`);
    }

    optionsRecord[optionName] = next;
    index += 2;
  }

  const [requestPath, responsePath] = positionalArguments;
  if (!requestPath || !responsePath) {
    throw new Error(
      'Usage: npx tsx scripts/harnessMetadataAdapter.ts [--provider deterministic|gh-copilot] [--strategy deterministic-first|deterministic-then-copilot|copilot-first] [--max-retries N] [--prompt-template path] <requestFile> <responseFile>'
    );
  }

  const provider = (optionsRecord.provider ?? DEFAULT_PROVIDER) as AdapterProvider;
  if (provider !== 'deterministic' && provider !== 'gh-copilot') {
    throw new Error(`Unsupported provider '${provider}'. Supported: deterministic, gh-copilot.`);
  }

  const maxRetriesRaw = optionsRecord['max-retries'] ?? `${DEFAULT_MAX_RETRIES}`;
  const maxRetries = Number(maxRetriesRaw);
  if (!Number.isInteger(maxRetries) || maxRetries <= 0) {
    throw new Error('--max-retries must be a positive integer.');
  }

  const strategy = (optionsRecord.strategy ?? 'deterministic-first') as AdapterStrategy;
  if (
    strategy !== 'deterministic-first' &&
    strategy !== 'deterministic-then-copilot' &&
    strategy !== 'copilot-first'
  ) {
    throw new Error(
      "--strategy must be 'deterministic-first', 'deterministic-then-copilot', or 'copilot-first'."
    );
  }

  return {
    provider,
    strategy,
    maxRetries,
    promptTemplatePath: optionsRecord['prompt-template'] ?? DEFAULT_PROMPT_TEMPLATE_PATH,
    requestPath,
    responsePath,
  };
}

function buildDeterministicResponse(request: MetadataRequest): MetadataResponse {
  const suggestedTestFilePaths = findSuggestedTestFiles(request.filePath, request.projectName);

  return {
    targetFilePath: request.filePath,
    suggestedTestFilePaths,
    recommendedCoverageCommand: buildCoverageCommand({
      projectName: request.projectName,
      suggestedTestFilePaths,
      targetFilePath: request.filePath,
    }),
    recommendedTestCommand: buildTestCommand({
      projectName: request.projectName,
      suggestedTestFilePaths,
      targetFilePath: request.filePath,
    }),
    behaviorsToTest: buildBehaviorHints(request.filePath),
    blockers:
      request.projectName === 'integration-tests'
        ? ['integration-tests-no-file-coverage-support']
        : [],
  };
}

async function buildCopilotResponse(args: {
  request: MetadataRequest;
  options: CliOptions;
}): Promise<MetadataResponse> {
  const { request, options } = args;

  const deterministicCandidate = buildDeterministicResponse(request);

  if (options.strategy === 'deterministic-first') {
    return {
      ...deterministicCandidate,
      blockers: uniqueStrings([
        ...(deterministicCandidate.blockers ?? []),
        'copilot-skipped-deterministic-first-strategy',
      ]),
    };
  }

  if (
    options.strategy === 'deterministic-then-copilot' &&
    !requiresCopilotForMetadata({
      request,
      deterministicCandidate,
    })
  ) {
    return deterministicCandidate;
  }

  const promptTemplate = fs.readFileSync(path.resolve(options.promptTemplatePath), 'utf-8');
  const fullPrompt = buildCopilotPrompt({
    promptTemplate,
    request,
    deterministicCandidate,
  });

  for (let attempt = 1; attempt <= options.maxRetries; attempt += 1) {
    let rawOutput = '';

    try {
      rawOutput = await invokeCopilotModel(fullPrompt);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(
        `Copilot invocation failed on attempt ${attempt}/${options.maxRetries}: ${errorMessage}`
      );
      continue;
    }

    const parseResult = tryParseAndValidateCopilotOutput({
      rawOutput,
      expectedFilePath: request.filePath,
    });

    if (parseResult.success) {
      return normalizeCopilotResponse({
        request,
        deterministicCandidate,
        copilotCandidate: parseResult.data,
      });
    }

    console.warn(
      `Copilot output validation failed on attempt ${attempt}/${options.maxRetries}: ${parseResult.errorMessage}`
    );
  }

  const fallbackBlockers = uniqueStrings([
    ...(deterministicCandidate.blockers ?? []),
    'copilot-output-invalid-fallback-deterministic',
  ]);

  console.warn(
    `Copilot output failed validation after ${options.maxRetries} retries. Falling back to deterministic metadata.`
  );

  return {
    ...deterministicCandidate,
    blockers: fallbackBlockers,
  };
}

function requiresCopilotForMetadata(args: {
  request: MetadataRequest;
  deterministicCandidate: MetadataResponse;
}): boolean {
  const { request, deterministicCandidate } = args;

  if (request.projectName === 'unknown') {
    return true;
  }

  if (request.projectName === 'integration-tests') {
    return true;
  }

  if (deterministicCandidate.suggestedTestFilePaths.length === 0) {
    return true;
  }

  return false;
}

function normalizeCopilotResponse(args: {
  request: MetadataRequest;
  deterministicCandidate: MetadataResponse;
  copilotCandidate: MetadataResponse;
}): MetadataResponse {
  const { request, deterministicCandidate, copilotCandidate } = args;

  const normalizedBehaviorsToTest =
    copilotCandidate.behaviorsToTest.length > 0
      ? copilotCandidate.behaviorsToTest
      : deterministicCandidate.behaviorsToTest;

  const mergedBlockers = uniqueStrings([
    ...(copilotCandidate.blockers ?? []),
    ...(deterministicCandidate.blockers ?? []),
  ]);

  if (deterministicCandidate.suggestedTestFilePaths.length === 0) {
    mergedBlockers.push('no-direct-test-file-detected');
  }

  return {
    targetFilePath: request.filePath,
    // Always trust repository-derived paths/commands to prevent hallucinated test filters.
    suggestedTestFilePaths: deterministicCandidate.suggestedTestFilePaths,
    recommendedCoverageCommand: deterministicCandidate.recommendedCoverageCommand,
    recommendedTestCommand: deterministicCandidate.recommendedTestCommand,
    behaviorsToTest: normalizedBehaviorsToTest,
    blockers: uniqueStrings(mergedBlockers),
  };
}

function buildCopilotPrompt(args: {
  promptTemplate: string;
  request: MetadataRequest;
  deterministicCandidate: MetadataResponse;
}): string {
  const { promptTemplate, request, deterministicCandidate } = args;

  return [
    promptTemplate,
    '',
    '## Metadata Request',
    JSON.stringify(request, null, 2),
    '',
    '## Deterministic Candidate (fallback baseline)',
    JSON.stringify(deterministicCandidate, null, 2),
  ].join('\n');
}

async function invokeCopilotModel(prompt: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    const copilotProcess = spawn('gh', ['copilot', '-p', prompt], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: COPILOT_TIMEOUT_MILLISECONDS,
    });

    let stdout = '';
    let stderr = '';

    copilotProcess.stdout.on('data', function collectStdout(chunk: Buffer) {
      stdout += chunk.toString();
    });

    copilotProcess.stderr.on('data', function collectStderr(chunk: Buffer) {
      stderr += chunk.toString();
    });

    copilotProcess.stdin.end();

    copilotProcess.on('close', function handleClose(exitCode: number | null) {
      if (exitCode !== 0) {
        reject(new Error(`gh copilot exited with code ${exitCode}: ${stderr.trim()}`));
        return;
      }

      resolve(stdout);
    });

    copilotProcess.on('error', reject);
  });
}

function tryParseAndValidateCopilotOutput(args: {
  rawOutput: string;
  expectedFilePath: string;
}): ParseValidationResult {
  const { rawOutput, expectedFilePath } = args;
  const sanitizedOutput = extractJsonFromOutput(rawOutput);

  let parsed: unknown;

  try {
    parsed = JSON.parse(sanitizedOutput);
  } catch {
    return {
      success: false,
      errorMessage: 'Output is not valid JSON.',
    };
  }

  const shapeCheck = validateMetadataResponseShape(parsed, expectedFilePath);
  if (!shapeCheck.success) {
    return shapeCheck;
  }

  return {
    success: true,
    data: shapeCheck.data,
  };
}

const ANSI_ESCAPE_PATTERN = new RegExp(
  String.raw`[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nq-uy=><~]`,
  'g'
);

function extractJsonFromOutput(rawOutput: string): string {
  const withoutAnsi = rawOutput.replace(ANSI_ESCAPE_PATTERN, '');
  const trimmed = withoutAnsi.trim();

  const fencedJsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);

  if (fencedJsonMatch) {
    return fencedJsonMatch[1].trim();
  }

  const jsonObjectMatch = trimmed.match(/\{[\s\S]*\}/);

  if (jsonObjectMatch) {
    return jsonObjectMatch[0].trim();
  }

  return trimmed;
}

function validateMetadataResponseShape(
  candidate: unknown,
  expectedFilePath: string
): ParseValidationResult {
  if (!candidate || typeof candidate !== 'object') {
    return {
      success: false,
      errorMessage: 'Response is not an object.',
    };
  }

  const typedCandidate = candidate as Partial<MetadataResponse>;

  if (typedCandidate.targetFilePath !== expectedFilePath) {
    return {
      success: false,
      errorMessage: `targetFilePath mismatch. expected='${expectedFilePath}' received='${typedCandidate.targetFilePath ?? ''}'`,
    };
  }

  if (!Array.isArray(typedCandidate.suggestedTestFilePaths)) {
    return {
      success: false,
      errorMessage: 'suggestedTestFilePaths must be an array of strings.',
    };
  }

  const areSuggestedFilesValid = typedCandidate.suggestedTestFilePaths.every(
    (item) => typeof item === 'string'
  );

  if (!areSuggestedFilesValid) {
    return {
      success: false,
      errorMessage: 'suggestedTestFilePaths contains non-string values.',
    };
  }

  if (typeof typedCandidate.recommendedCoverageCommand !== 'string') {
    return {
      success: false,
      errorMessage: 'recommendedCoverageCommand must be a string.',
    };
  }

  if (typeof typedCandidate.recommendedTestCommand !== 'string') {
    return {
      success: false,
      errorMessage: 'recommendedTestCommand must be a string.',
    };
  }

  if (!Array.isArray(typedCandidate.behaviorsToTest)) {
    return {
      success: false,
      errorMessage: 'behaviorsToTest must be an array of strings.',
    };
  }

  const areBehaviorsValid = typedCandidate.behaviorsToTest.every(
    (item) => typeof item === 'string'
  );

  if (!areBehaviorsValid) {
    return {
      success: false,
      errorMessage: 'behaviorsToTest contains non-string values.',
    };
  }

  return {
    success: true,
    data: {
      targetFilePath: typedCandidate.targetFilePath,
      suggestedTestFilePaths: typedCandidate.suggestedTestFilePaths,
      recommendedCoverageCommand: typedCandidate.recommendedCoverageCommand,
      recommendedTestCommand: typedCandidate.recommendedTestCommand,
      behaviorsToTest: typedCandidate.behaviorsToTest,
      blockers:
        typedCandidate.blockers && Array.isArray(typedCandidate.blockers)
          ? typedCandidate.blockers.filter((item): item is string => typeof item === 'string')
          : [],
    },
  };
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

  if (
    projectName === 'api' ||
    projectName === 'core' ||
    projectName === 'ui' ||
    projectName === 'common'
  ) {
    const libraryRelativePath = filePath.replace(/^libs\/(api|core|ui|common)\//, '');
    candidateSet.add(
      `libs/${projectName}/${libraryRelativePath.replace(/\.[jt]sx?$/, '.test.ts')}`
    );
    candidateSet.add(
      `libs/${projectName}/${libraryRelativePath.replace(/\.[jt]sx?$/, '.test.tsx')}`
    );
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
  targetFilePath: string;
}): string {
  const { projectName, suggestedTestFilePaths, targetFilePath } = args;
  const [firstTest] = suggestedTestFilePaths;
  const normalizedTestPath = normalizeTestPathForProject({
    projectName,
    testFilePath: firstTest,
  });
  const normalizedTargetFilePath = normalizeSourcePathForProject({
    projectName,
    filePath: targetFilePath,
  });

  if (projectName === 'backend') {
    if (firstTest) {
      return `npx nx test backend --configuration=coverage --testPathPattern=${shellQuote(firstTest)}`;
    }
    return 'npx nx test backend --configuration=coverage';
  }

  if (projectName === 'frontend') {
    if (firstTest) {
      return `vitest --root frontend --config vite.config.ts --reporter=verbose --coverage --bail=1 --run ${shellQuote(firstTest)}`;
    }

    if (normalizedTargetFilePath) {
      return `cd frontend && npx vitest related --coverage --run --passWithNoTests ${shellQuote(normalizedTargetFilePath)}`;
    }

    return 'echo "coverage-related-source-not-supported"';
  }

  if (
    projectName === 'api' ||
    projectName === 'core' ||
    projectName === 'ui' ||
    projectName === 'common'
  ) {
    if (normalizedTestPath) {
      return `npx nx test ${projectName} --coverage --run ${shellQuote(normalizedTestPath)}`;
    }

    if (normalizedTargetFilePath) {
      return `cd libs/${projectName} && npx vitest related --coverage --run --passWithNoTests ${shellQuote(normalizedTargetFilePath)}`;
    }

    return 'echo "coverage-related-source-not-supported"';
  }

  return 'echo "coverage-not-supported-for-project"';
}

function buildTestCommand(args: {
  projectName: ProjectName;
  suggestedTestFilePaths: string[];
  targetFilePath: string;
}): string {
  const { projectName, suggestedTestFilePaths, targetFilePath } = args;
  const [firstTest] = suggestedTestFilePaths;
  const normalizedTestPath = normalizeTestPathForProject({
    projectName,
    testFilePath: firstTest,
  });
  const normalizedTargetFilePath = normalizeSourcePathForProject({
    projectName,
    filePath: targetFilePath,
  });

  if (projectName === 'backend') {
    if (firstTest) return `npx nx test backend --testPathPattern=${shellQuote(firstTest)}`;
    return 'npx nx test backend';
  }

  if (projectName === 'frontend') {
    if (firstTest) {
      return `vitest --root frontend --config vite.config.ts --reporter=verbose --no-coverage --bail=1 --run ${shellQuote(firstTest)}`;
    }

    if (normalizedTargetFilePath) {
      return `cd frontend && npx vitest related --run --passWithNoTests ${shellQuote(normalizedTargetFilePath)}`;
    }

    return 'echo "test-related-source-not-supported"';
  }

  if (
    projectName === 'api' ||
    projectName === 'core' ||
    projectName === 'ui' ||
    projectName === 'common'
  ) {
    if (normalizedTestPath) {
      return `npx nx test ${projectName} --run ${shellQuote(normalizedTestPath)}`;
    }

    if (normalizedTargetFilePath) {
      return `cd libs/${projectName} && npx vitest related --run --passWithNoTests ${shellQuote(normalizedTargetFilePath)}`;
    }

    return 'echo "test-related-source-not-supported"';
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

  if (
    projectName === 'api' ||
    projectName === 'core' ||
    projectName === 'ui' ||
    projectName === 'common'
  ) {
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

function normalizeSourcePathForProject(args: {
  projectName: ProjectName;
  filePath: string;
}): string | null {
  const { projectName, filePath } = args;

  if (
    projectName === 'api' ||
    projectName === 'core' ||
    projectName === 'ui' ||
    projectName === 'common'
  ) {
    return filePath.replace(new RegExp(`^libs/${projectName}/`), '');
  }

  if (projectName === 'frontend') {
    return filePath.replace(/^frontend\//, '');
  }

  if (projectName === 'backend') {
    return filePath.replace(/^backend\//, '');
  }

  return null;
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

void main();
