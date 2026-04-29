import getReadableErrorMessage from './helpers/getReadableErrorMessage';
import executeStepPipeline from './helpers/executeStepPipeline';
import askTestScope from './steps/AskTestScope';
import resolveAffectedFiles from './steps/ResolveAffectedFiles';
import normalizeCoverageData from './steps/NormalizeCoverageData';
import processFiles from './steps/ProcessFiles';
import type { PipelineContext, PipelineStep, TestScope } from './types';

async function runPipeline(): Promise<void> {
  const context: PipelineContext = {
    testScope: null,
    affectedFiles: null,
    normalizedCoverageData: null,
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
      name: 'Normalize coverage data',
      execute: normalizeCoverageData,
    },
    // Captures current coverage per file.

    // Homologate test state
    // - If there is no test it creates an empty test file with 0% coverage.
    // - If the mark is already cover 80% it leaves it as is.
    // - Sends to the next segment all the list of test files who needs to be processed to reach the threshold.

    /**
     * Process a secondary pipeline were we can iterate over each file asking copilot adding testing with certain
     * specifications (good practices, restrictions, etc).
     *
     * At the end of this pipiline we use the normalize coverage metadata to evaluate the threshold and decide if we need to iterate again or we are done.
     * This for coverage.
     */
    {
      name: 'Process files coverage',
      execute: processFiles,
    },

    /**
     * New pipelines to evaluate various metrics with an scale from 1 to 5 or true/false and decide if add the to secondary pipelines...
     * ex: {
     *  isOverMocked: 3,
     *  isTestingFunctionality: 2,
     * ...
     * }
     * */
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
