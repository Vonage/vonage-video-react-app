import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { FilePipelineContext, StepExecutionResult } from '../types';

async function readFileContent(context: FilePipelineContext): Promise<StepExecutionResult> {
  const absolutePath = resolve(process.cwd(), context.filePath);
  const fileContent = await readFile(absolutePath, 'utf-8');

  context.fileContent = fileContent;

  return {
    inputSummary: JSON.stringify({ filePath: context.filePath }, null, 2),
    outputSummary: JSON.stringify(
      { filePath: context.filePath, contentLength: fileContent.length },
      null,
      2
    ),
  };
}

export default readFileContent;
