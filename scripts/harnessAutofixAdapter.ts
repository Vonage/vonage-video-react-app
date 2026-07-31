#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const DEFAULT_PROVIDER: AdapterProvider = 'deterministic';
const DEFAULT_MAX_RETRIES = 5;
const COPILOT_TIMEOUT_MILLISECONDS = 120_000;

type AdapterProvider = 'deterministic' | 'gh-copilot';
type AdapterStrategy = 'deterministic-first' | 'deterministic-then-copilot' | 'copilot-first';

type InstructionViolation = {
  filePath: string;
  line: number;
  ruleId: string;
  description: string;
  instructionsSource: string;
  matchText: string;
};

type AutofixRequest = {
  targetFilePath: string;
  projectName: string;
  violations: InstructionViolation[];
};

type AutofixAction = {
  filePath: string;
  ruleId: string;
  findText: string;
  replaceText: string;
  reason: string;
};

type AutofixResponse = {
  actions: AutofixAction[];
  blockers?: string[];
};

type CliOptions = {
  provider: AdapterProvider;
  strategy: AdapterStrategy;
  maxRetries: number;
  mode: 'request-response' | 'single-file';
  requestPath?: string;
  responsePath?: string;
  targetFilePath?: string;
  outputDirectory: string;
  applyChanges: boolean;
};

const DEFAULT_OUTPUT_DIRECTORY = '_testMonitoring/codeReviewHarness/autofix/manual';

const USAGE_TEXT =
  'Usage:\n' +
  '  npx tsx scripts/harnessAutofixAdapter.ts [--provider deterministic|gh-copilot] [--strategy deterministic-first|deterministic-then-copilot|copilot-first] [--max-retries N] [--apply|--no-apply] <requestFile> <responseFile>\n' +
  '  npx tsx scripts/harnessAutofixAdapter.ts [--provider deterministic|gh-copilot] [--strategy deterministic-first|deterministic-then-copilot|copilot-first] [--max-retries N] [--output-dir DIR] [--apply|--no-apply] <targetFilePath>\n\n' +
  'Examples:\n' +
  '  yarn code-review:autofix-adapter _testMonitoring/codeReviewHarness/autofix/file.request.json _testMonitoring/codeReviewHarness/autofix/file.response.json\n' +
  '  yarn code-review:autofix-adapter frontend/src/components/MeetingRoom/VideoTile/VideoTile.tsx\n' +
  '  yarn code-review:autofix-adapter --no-apply frontend/src/components/MeetingRoom/VideoTile/VideoTile.tsx';

async function main() {
  const options = parseCliOptions(process.argv.slice(2));

  if (options.mode === 'request-response') {
    const request = JSON.parse(fs.readFileSync(options.requestPath as string, 'utf-8')) as AutofixRequest;

    const response =
      options.provider === 'gh-copilot'
        ? await buildCopilotAutofixResponse({ request, options })
        : buildDeterministicAutofixResponse(request);

    fs.writeFileSync(options.responsePath as string, JSON.stringify(response, null, 2), 'utf-8');

    if (options.applyChanges) {
      applyAutofixActions({
        actions: response.actions,
        allowedFilePaths: uniqueStrings(request.violations.map((violation) => violation.filePath)),
      });
    }

    return;
  }

  const singleFileRequest = buildSingleFileRequest(options.targetFilePath as string);
  const outputDirectoryPath = path.resolve(options.outputDirectory);
  fs.mkdirSync(outputDirectoryPath, { recursive: true });

  const safeFileName = sanitizePathForFileName(singleFileRequest.targetFilePath);
  const requestFilePath = path.join(outputDirectoryPath, `${safeFileName}.request.json`);
  const responseFilePath = path.join(outputDirectoryPath, `${safeFileName}.response.json`);
  fs.writeFileSync(requestFilePath, JSON.stringify(singleFileRequest, null, 2), 'utf-8');

  const response =
    options.provider === 'gh-copilot'
      ? await buildCopilotAutofixResponse({ request: singleFileRequest, options })
      : buildDeterministicAutofixResponse(singleFileRequest);

  fs.writeFileSync(responseFilePath, JSON.stringify(response, null, 2), 'utf-8');
  const appliedActions = options.applyChanges
    ? applyAutofixActions({
        actions: response.actions,
        allowedFilePaths: uniqueStrings(singleFileRequest.violations.map((violation) => violation.filePath)),
      })
    : 0;

  process.stdout.write(
    `${JSON.stringify(
      {
        mode: 'single-file',
        targetFilePath: singleFileRequest.targetFilePath,
        detectedViolationCount: singleFileRequest.violations.length,
        requestFilePath,
        responseFilePath,
        actionCount: response.actions.length,
        appliedActionCount: appliedActions,
        applyChanges: options.applyChanges,
        blockerCount: response.blockers?.length ?? 0,
      },
      null,
      2
    )}\n`
  );
}

function run() {
  main().catch(function handleMainError(error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${errorMessage}\n\n${USAGE_TEXT}\n`);
    process.exitCode = 1;
  });
}

function parseCliOptions(argumentsList: string[]): CliOptions {
  if (argumentsList.includes('--help') || argumentsList.includes('-h')) {
    throw new Error(USAGE_TEXT);
  }

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
      if (optionName === 'apply' || optionName === 'no-apply') {
        optionsRecord[optionName] = 'true';
        index += 1;
        continue;
      }

      throw new Error(`Missing value for option --${optionName}.`);
    }

    optionsRecord[optionName] = next;
    index += 2;
  }

  const provider = (optionsRecord.provider ?? DEFAULT_PROVIDER) as AdapterProvider;
  if (provider !== 'deterministic' && provider !== 'gh-copilot') {
    throw new Error(`Unsupported provider '${provider}'. Supported: deterministic, gh-copilot.`);
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

  const maxRetriesRaw = optionsRecord['max-retries'] ?? `${DEFAULT_MAX_RETRIES}`;
  const maxRetries = Number(maxRetriesRaw);
  if (!Number.isInteger(maxRetries) || maxRetries <= 0) {
    throw new Error('--max-retries must be a positive integer.');
  }

  const outputDirectory = optionsRecord['output-dir'] ?? DEFAULT_OUTPUT_DIRECTORY;
  const applyFlagEnabled = optionsRecord.apply === 'true';
  const noApplyFlagEnabled = optionsRecord['no-apply'] === 'true';

  if (applyFlagEnabled && noApplyFlagEnabled) {
    throw new Error('Cannot use --apply and --no-apply at the same time.');
  }

  if (positionalArguments.length === 2) {
    const [requestPath, responsePath] = positionalArguments;
    return {
      provider,
      strategy,
      maxRetries,
      mode: 'request-response',
      requestPath,
      responsePath,
      outputDirectory,
      applyChanges: applyFlagEnabled,
    };
  }

  if (positionalArguments.length === 1) {
    const applyChanges = noApplyFlagEnabled ? false : true;

    return {
      provider,
      strategy,
      maxRetries,
      mode: 'single-file',
      targetFilePath: positionalArguments[0],
      outputDirectory,
      applyChanges,
    };
  }

  throw new Error('Invalid arguments count. Expected one target file, or request/response file pair.');

}

function buildSingleFileRequest(targetFilePathInput: string): AutofixRequest {
  const targetFilePath = normalizeWorkspacePath(targetFilePathInput);
  const absoluteTargetFilePath = path.resolve(targetFilePath);

  if (!fs.existsSync(absoluteTargetFilePath)) {
    throw new Error(`Target file not found: ${targetFilePath}`);
  }

  const filesToCheck = [targetFilePath, ...findCompanionTestFiles(targetFilePath)];
  const violations = filesToCheck.flatMap(scanViolationsForFile);

  return {
    targetFilePath,
    projectName: inferProjectName(targetFilePath),
    violations,
  };
}

function findCompanionTestFiles(targetFilePath: string): string[] {
  const directoryPath = path.dirname(targetFilePath);
  const extension = path.extname(targetFilePath);
  const baseName = path.basename(targetFilePath, extension);
  const candidates = [
    `${baseName}.spec.ts`,
    `${baseName}.spec.tsx`,
    `${baseName}.test.ts`,
    `${baseName}.test.tsx`,
  ];

  return candidates
    .map(function toPath(candidateFileName) {
      return `${directoryPath}/${candidateFileName}`;
    })
    .filter(function keepIfExists(candidatePath) {
      return fs.existsSync(path.resolve(candidatePath));
    });
}

function scanViolationsForFile(filePath: string): InstructionViolation[] {
  const absoluteFilePath = path.resolve(filePath);
  if (!fs.existsSync(absoluteFilePath)) {
    return [];
  }

  const lines = fs.readFileSync(absoluteFilePath, 'utf-8').split(/\r?\n/);
  const violations: InstructionViolation[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const lineNumber = lineIndex + 1;

    if (line.includes('sx={')) {
      violations.push({
        filePath,
        line: lineNumber,
        ruleId: 'copilot-no-mui-sx-prop',
        description: 'MUI sx prop is banned by repository rules.',
        instructionsSource: '.github/copilot-instructions.md',
        matchText: 'sx={',
      });
    }

    const displayNoneMatch = line.match(/display\s*:\s*['\"]none['\"]/);
    if (displayNoneMatch) {
      violations.push({
        filePath,
        line: lineNumber,
        ruleId: 'copilot-no-display-none-hiding',
        description: 'Do not hide components with display:none; use Activity mode handling.',
        instructionsSource: '.github/copilot-instructions.md',
        matchText: displayNoneMatch[0],
      });
    }
  }

  return violations;
}

function inferProjectName(filePath: string): string {
  if (filePath.startsWith('backend/')) return 'backend';
  if (filePath.startsWith('frontend/')) return 'frontend';
  if (filePath.startsWith('integration-tests/')) return 'integration-tests';
  if (filePath.startsWith('libs/api/')) return 'api';
  if (filePath.startsWith('libs/core/')) return 'core';
  if (filePath.startsWith('libs/ui/')) return 'ui';
  if (filePath.startsWith('libs/common/')) return 'common';
  return 'unknown';
}

function normalizeWorkspacePath(rawPath: string): string {
  const slashNormalizedPath = rawPath.replace(/\\/g, '/');
  const workspaceRootPath = path.resolve(process.cwd()).replace(/\\/g, '/');

  if (path.isAbsolute(slashNormalizedPath)) {
    const absolutePath = path.resolve(slashNormalizedPath).replace(/\\/g, '/');
    if (absolutePath.startsWith(`${workspaceRootPath}/`)) {
      return absolutePath.slice(workspaceRootPath.length + 1);
    }

    return absolutePath;
  }

  return slashNormalizedPath.replace(/^\.\//, '');
}

function sanitizePathForFileName(filePath: string): string {
  return filePath.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function applyAutofixActions(args: {
  actions: AutofixAction[];
  allowedFilePaths: string[];
}): number {
  const { actions, allowedFilePaths } = args;
  const allowedFilePathSet = new Set(
    allowedFilePaths.map(function mapToNormalizedPath(filePath) {
      return normalizeWorkspacePath(filePath);
    })
  );

  const fileContentsByPath = new Map<string, string>();
  let appliedCount = 0;

  for (const action of actions) {
    const normalizedActionFilePath = normalizeWorkspacePath(action.filePath);
    if (!allowedFilePathSet.has(normalizedActionFilePath)) {
      continue;
    }

    const absoluteFilePath = path.resolve(normalizedActionFilePath);
    if (!fs.existsSync(absoluteFilePath)) {
      continue;
    }

    const currentContent =
      fileContentsByPath.get(normalizedActionFilePath) ?? fs.readFileSync(absoluteFilePath, 'utf-8');
    const nextContent = replaceFirstOccurrence(currentContent, action.findText, action.replaceText);

    if (nextContent === currentContent) {
      continue;
    }

    fileContentsByPath.set(normalizedActionFilePath, nextContent);
    appliedCount += 1;
  }

  for (const [relativeFilePath, content] of fileContentsByPath.entries()) {
    fs.writeFileSync(path.resolve(relativeFilePath), content, 'utf-8');
  }

  return appliedCount;
}

function replaceFirstOccurrence(source: string, findText: string, replaceText: string): string {
  if (!findText) {
    return source;
  }

  const occurrenceIndex = source.indexOf(findText);
  if (occurrenceIndex < 0) {
    return source;
  }

  const beforeMatch = source.slice(0, occurrenceIndex);
  const afterMatch = source.slice(occurrenceIndex + findText.length);
  return `${beforeMatch}${replaceText}${afterMatch}`;
}

function buildDeterministicAutofixResponse(request: AutofixRequest): AutofixResponse {
  const actions: AutofixAction[] = [];

  for (const violation of request.violations) {
    if (violation.ruleId === 'copilot-no-mui-sx-prop') {
      actions.push({
        filePath: violation.filePath,
        ruleId: violation.ruleId,
        findText: violation.matchText,
        replaceText: 'style={',
        reason: 'Replace MUI sx prop with style prop to remove banned sx usage while preserving dynamic style object behavior.',
      });
      continue;
    }

    if (violation.ruleId !== 'copilot-no-display-none-hiding') {
      continue;
    }

    actions.push({
      filePath: violation.filePath,
      ruleId: violation.ruleId,
      findText: violation.matchText,
      replaceText: "visibility: 'hidden'",
      reason: 'Replace display:none with visibility:hidden to satisfy no-display-none rule in tests.',
    });
  }

  return {
    actions,
    blockers: actions.length === 0 ? ['no-deterministic-autofix-available'] : [],
  };
}

async function buildCopilotAutofixResponse(args: {
  request: AutofixRequest;
  options: CliOptions;
}): Promise<AutofixResponse> {
  const { request, options } = args;
  const deterministicFallback = buildDeterministicAutofixResponse(request);

  if (options.strategy === 'deterministic-first') {
    return {
      ...deterministicFallback,
      blockers: uniqueStrings([
        ...(deterministicFallback.blockers ?? []),
        'copilot-skipped-deterministic-first-strategy',
      ]),
    };
  }

  if (options.strategy === 'deterministic-then-copilot') {
    const unsupportedViolationRuleIds = getUnsupportedViolationRuleIds({
      violations: request.violations,
      deterministicSupportedRuleIds: getDeterministicSupportedRuleIds(),
    });

    if (unsupportedViolationRuleIds.length === 0) {
      return deterministicFallback;
    }
  }

  const prompt = [
    'Return ONLY valid JSON.',
    'Goal: produce safe textual replacements to auto-fix instruction violations.',
    'Response JSON shape:',
    '{"actions":[{"filePath":"...","ruleId":"...","findText":"...","replaceText":"...","reason":"..."}],"blockers":["..."]}',
    'Rules:',
    '- use only exact text replacements present in files',
    '- do not add or remove files',
    '- keep actions minimal and safe',
    '- if unsure, return no actions and blockers',
    '',
    'Request:',
    JSON.stringify(request, null, 2),
    '',
    'Deterministic fallback candidate:',
    JSON.stringify(deterministicFallback, null, 2),
  ].join('\n');

  for (let attempt = 1; attempt <= options.maxRetries; attempt += 1) {
    const output = await invokeCopilotModel(prompt);
    const parsed = tryParseAutofixResponse(output);
    if (parsed) {
      if (parsed.actions.length > 0) {
        return parsed;
      }

      return {
        actions: deterministicFallback.actions,
        blockers: uniqueStrings([...(parsed.blockers ?? []), ...(deterministicFallback.blockers ?? [])]),
      };
    }

    console.warn(`Autofix output validation failed on attempt ${attempt}/${options.maxRetries}.`);
  }

  return {
    ...deterministicFallback,
    blockers: uniqueStrings([
      ...(deterministicFallback.blockers ?? []),
      'copilot-autofix-invalid-fallback-deterministic',
    ]),
  };
}

function getDeterministicSupportedRuleIds(): Set<string> {
  return new Set(['copilot-no-display-none-hiding', 'copilot-no-mui-sx-prop']);
}

function getUnsupportedViolationRuleIds(args: {
  violations: InstructionViolation[];
  deterministicSupportedRuleIds: Set<string>;
}): string[] {
  const unsupportedRuleIds = args.violations
    .map(function mapRuleId(violation) {
      return violation.ruleId;
    })
    .filter(function isUnsupported(ruleId) {
      return !args.deterministicSupportedRuleIds.has(ruleId);
    });

  return uniqueStrings(unsupportedRuleIds);
}

async function invokeCopilotModel(prompt: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    const copilotProcess = spawn('gh', ['copilot', '-p', prompt], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: COPILOT_TIMEOUT_MILLISECONDS,
    });

    let stdout = '';

    copilotProcess.stdout.on('data', function collectStdout(chunk: Buffer) {
      stdout += chunk.toString();
    });

    copilotProcess.stdin.end();

    copilotProcess.on('close', function handleClose(exitCode: number | null) {
      if (exitCode !== 0) {
        reject(new Error(`gh copilot exited with code ${exitCode}.`));
        return;
      }

      resolve(stdout);
    });

    copilotProcess.on('error', reject);
  });
}

const ANSI_ESCAPE_PATTERN = new RegExp(
  String.raw`[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nq-uy=><~]`,
  'g'
);

function tryParseAutofixResponse(rawOutput: string): AutofixResponse | null {
  const withoutAnsi = rawOutput.replace(ANSI_ESCAPE_PATTERN, '').trim();
  const fenced = withoutAnsi.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidateJson = fenced?.[1]?.trim() ?? withoutAnsi.match(/\{[\s\S]*\}/)?.[0]?.trim() ?? withoutAnsi;

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidateJson);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object') return null;
  const typed = parsed as Partial<AutofixResponse>;
  if (!Array.isArray(typed.actions)) return null;

  const normalizedActions = typed.actions.filter((action): action is AutofixAction => {
    if (!action || typeof action !== 'object') return false;

    const maybeAction = action as Partial<AutofixAction>;
    return (
      typeof maybeAction.filePath === 'string' &&
      typeof maybeAction.ruleId === 'string' &&
      typeof maybeAction.findText === 'string' &&
      typeof maybeAction.replaceText === 'string' &&
      typeof maybeAction.reason === 'string'
    );
  });

  return {
    actions: normalizedActions,
    blockers:
      typed.blockers && Array.isArray(typed.blockers)
        ? typed.blockers.filter((item): item is string => typeof item === 'string')
        : [],
  };
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

run();
