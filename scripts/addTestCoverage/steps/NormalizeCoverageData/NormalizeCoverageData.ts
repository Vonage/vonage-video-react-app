import promptCopilotForNormalization from './helpers/promptCopilotForNormalization';
import type { PipelineContext, StepExecutionResult } from '../../types';

async function normalizeCoverageData(context: PipelineContext): Promise<StepExecutionResult> {
  if (!context.affectedFiles || context.affectedFiles.length === 0) {
    throw new Error('Affected files must be resolved before normalizing coverage data.');
  }

  const normalizedData = await promptCopilotForNormalization({
    affectedFiles: context.affectedFiles,
  });

  context.normalizedCoverageData = normalizedData;

  return {
    inputSummary: JSON.stringify(
      {
        affectedFileCount: context.affectedFiles.length,
        affectedFiles: context.affectedFiles,
      },
      null,
      2
    ),
    outputSummary: JSON.stringify(
      {
        projectType: normalizedData.pipelineContext.projectType,
        testFramework: normalizedData.pipelineContext.testFramework,
        normalizedFileCount: normalizedData.files.length,
      },
      null,
      2
    ),
  };
}

export default normalizeCoverageData;
