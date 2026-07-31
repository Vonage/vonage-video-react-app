#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import * as fs from 'node:fs';

const DEFAULT_PROVIDER: AdapterProvider = 'deterministic';
const DEFAULT_MAX_RETRIES = 5;
const COPILOT_TIMEOUT_MILLISECONDS = 120_000;

type AdapterProvider = 'deterministic' | 'gh-copilot';

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
  maxRetries: number;
  requestPath: string;
  responsePath: string;
};

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  const request = JSON.parse(fs.readFileSync(options.requestPath, 'utf-8')) as AutofixRequest;

  const response =
    options.provider === 'gh-copilot'
      ? await buildCopilotAutofixResponse({ request, options })
      : buildDeterministicAutofixResponse(request);

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
      'Usage: npx tsx scripts/harnessAutofixAdapter.ts [--provider deterministic|gh-copilot] [--max-retries N] <requestFile> <responseFile>'
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

  return {
    provider,
    maxRetries,
    requestPath,
    responsePath,
  };
}

function buildDeterministicAutofixResponse(request: AutofixRequest): AutofixResponse {
  const actions: AutofixAction[] = [];

  for (const violation of request.violations) {
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
      return parsed;
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

void main();
