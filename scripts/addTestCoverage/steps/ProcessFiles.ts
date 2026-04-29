import executeStepPipeline from '../helpers/executeStepPipeline';
import readFileContent from '../fileSteps/01_ReadFileContent';
import type {
  FilePipelineContext,
  PipelineContext,
  PipelineStep,
  StepExecutionResult,
} from '../types';

async function processFiles(context: PipelineContext): Promise<StepExecutionResult> {
  if (!context.testScope) {
    throw new Error('Test scope must be resolved before processing files.');
  }

  if (!context.affectedFiles || context.affectedFiles.length === 0) {
    throw new Error('No affected files to process.');
  }

  const fileSteps: PipelineStep<FilePipelineContext>[] = [
    {
      name: 'Read file content',
      execute: readFileContent,
    },
  ];

  const processedFiles: string[] = [];

  for (const filePath of context.affectedFiles) {
    const fileContext: FilePipelineContext = {
      filePath,
      testScope: context.testScope,
      fileContent: null,
    };

    await executeStepPipeline({
      context: fileContext,
      steps: fileSteps,
      label: filePath,
    });

    processedFiles.push(filePath);
  }

  return {
    inputSummary: JSON.stringify(
      { affectedFileCount: context.affectedFiles.length, affectedFiles: context.affectedFiles },
      null,
      2
    ),
    outputSummary: JSON.stringify(
      { processedFileCount: processedFiles.length, processedFiles },
      null,
      2
    ),
  };
}

export default processFiles;
