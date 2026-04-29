import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import type { PipelineContext, StepExecutionResult, TestScope } from '../types';

async function askTestScope(context: PipelineContext): Promise<StepExecutionResult> {
  const cliPathArgument = process.argv[2]?.trim() ?? '';

  if (cliPathArgument) {
    return resolvePathScope({ context, rawPath: cliPathArgument, selectedOption: 'cli-arg' });
  }

  const commandLineInterface = createInterface({ input: stdin, output: stdout });
  let selectedOption = '';
  const providedPath = 'n/a';

  try {
    console.log('What are the tests for?');
    console.log('1) Last commit');
    console.log('2) Current non-committed changes (working tree)');
    console.log('3) Path/file');

    selectedOption = (
      await commandLineInterface.question('Select an option (1, 2, or 3): ')
    ).trim();

    validateSelectedOption(selectedOption);

    if (selectedOption === '1') {
      context.testScope = { type: 'last-commit' };

      return buildStepExecutionResult({
        providedPath,
        selectedOption,
        selectedScope: context.testScope,
      });
    }

    if (selectedOption === '2') {
      context.testScope = { type: 'working-tree' };

      return buildStepExecutionResult({
        providedPath,
        selectedOption,
        selectedScope: context.testScope,
      });
    }

    const rawPath = (await commandLineInterface.question('Enter file/path: ')).trim();

    return resolvePathScope({ context, rawPath, selectedOption });
  } finally {
    commandLineInterface.close();
  }
}

type ResolvePathScopeArgs = {
  context: PipelineContext;
  rawPath: string;
  selectedOption: string;
};

async function resolvePathScope(args: ResolvePathScopeArgs): Promise<StepExecutionResult> {
  const { context, rawPath, selectedOption } = args;

  if (!rawPath) {
    throw new Error('Path/file cannot be empty when option 3 is selected.');
  }

  const absolutePath = resolve(process.cwd(), rawPath);
  await stat(absolutePath);

  context.testScope = {
    type: 'path',
    path: rawPath,
  };

  return buildStepExecutionResult({
    providedPath: rawPath,
    selectedOption,
    selectedScope: context.testScope,
  });
}

function validateSelectedOption(selectedOption: string): void {
  if (selectedOption === '1' || selectedOption === '2' || selectedOption === '3') {
    return;
  }

  throw new Error(`Invalid option "${selectedOption}". Allowed values are 1, 2, or 3.`);
}

type BuildStepExecutionResultArgs = {
  providedPath: string;
  selectedOption: string;
  selectedScope: TestScope;
};

function buildStepExecutionResult(args: BuildStepExecutionResultArgs): StepExecutionResult {
  const { providedPath, selectedOption, selectedScope } = args;

  return {
    inputSummary: JSON.stringify(
      {
        selectedOption,
        providedPath,
      },
      null,
      2
    ),
    outputSummary: JSON.stringify(
      {
        selectedScope,
      },
      null,
      2
    ),
  };
}

export default askTestScope;
