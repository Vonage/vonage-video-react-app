import getReadableErrorMessage from './helpers/getReadableErrorMessage';
import executeStepPipeline from './helpers/executeStepPipeline';
import askTestScope from './steps/01_AskTestScope';
import resolveAffectedFiles from './steps/02_ResolveAffectedFiles';
import processFiles from './steps/03_ProcessFiles';
import type { PipelineContext, PipelineStep, TestScope } from './types';

async function runPipeline(): Promise<void> {
  const context: PipelineContext = {
    testScope: null,
    affectedFiles: null,
  };

  const pipelineSteps: PipelineStep<PipelineContext>[] = [
    {
      name: 'Ask test scope',
      execute: askTestScope,
    },
    {
      name: 'Resolve affected files',
      execute: resolveAffectedFiles,
    },
    {
      name: 'Process files',
      execute: processFiles,
    },
  ];

  await executeStepPipeline({ context, steps: pipelineSteps });

  if (!context.testScope) {
    throw new Error('No test scope was selected.');
  }

  if (!context.affectedFiles || context.affectedFiles.length === 0) {
    throw new Error('No affected files were found for the selected scope.');
  }

  printSelectedScope(context.testScope);
  console.log(`Affected files (${context.affectedFiles.length}):`);

  for (const filePath of context.affectedFiles) {
    console.log(`  ${filePath}`);
  }
}

function printSelectedScope(testScope: TestScope): void {
  let readableDescription = '';

  if (testScope.type === 'last-commit') {
    readableDescription = 'last commit';
  } else if (testScope.type === 'working-tree') {
    readableDescription = 'current non-committed changes (working tree)';
  } else {
    readableDescription = `path/file: ${testScope.path}`;
  }

  console.log(`Selected test scope: ${readableDescription}`);
}

void runPipeline().catch(function handlePipelineError(error: unknown) {
  const readableErrorMessage = getReadableErrorMessage(error);

  console.error('Pipeline failed early.');
  console.error(`Reason: ${readableErrorMessage}`);
  process.exitCode = 1;
});
