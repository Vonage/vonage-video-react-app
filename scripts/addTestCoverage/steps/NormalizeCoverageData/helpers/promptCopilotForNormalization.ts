import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import NormalizeCoverageDataSchema from './normalizeCoverageDataSchema';
import type { NormalizeCoverageData } from './normalizeCoverageDataSchema';

const MAX_RETRIES = 10;
const COPILOT_TIMEOUT_MILLISECONDS = 120_000; // 2 minutes

type PromptCopilotForNormalizationArgs = {
  affectedFiles: string[];
};

async function promptCopilotForNormalization(
  args: PromptCopilotForNormalizationArgs
): Promise<NormalizeCoverageData> {
  const { affectedFiles } = args;
  const promptTemplate = await loadPromptTemplate();
  const fullPrompt = buildFullPrompt({ promptTemplate, affectedFiles });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const rawOutput = await invokeCopilotModel(fullPrompt);

    console.log(`\n--- Copilot raw output (attempt ${attempt}) ---`);
    console.log(rawOutput);
    console.log('--- End of raw output ---\n');

    const parseResult = tryParseAndValidate(rawOutput);

    if (parseResult.success) {
      return parseResult.data;
    }

    console.warn(
      `Attempt ${attempt}/${MAX_RETRIES} failed validation: ${parseResult.errorMessage}`
    );
  }

  throw new Error(`Copilot output failed schema validation after ${MAX_RETRIES} retries.`);
}

async function loadPromptTemplate(): Promise<string> {
  const readmePath = resolve(__dirname, '..', 'normalizeCoverageData.md');

  return readFile(readmePath, 'utf-8');
}

type BuildFullPromptArgs = {
  promptTemplate: string;
  affectedFiles: string[];
};

function buildFullPrompt(args: BuildFullPromptArgs): string {
  const { promptTemplate, affectedFiles } = args;
  const fileList = affectedFiles.map((filePath) => `- ${filePath}`).join('\n');

  return `${promptTemplate}\n\n## Affected Files\n\n${fileList}`;
}

async function invokeCopilotModel(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
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

type ParseSuccess = {
  success: true;
  data: NormalizeCoverageData;
};

type ParseFailure = {
  success: false;
  errorMessage: string;
};

function tryParseAndValidate(rawOutput: string): ParseSuccess | ParseFailure {
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

  const validationResult = NormalizeCoverageDataSchema.safeParse(parsed);

  if (!validationResult.success) {
    return {
      success: false,
      errorMessage: validationResult.error.message,
    };
  }

  return {
    success: true,
    data: validationResult.data,
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

export default promptCopilotForNormalization;
