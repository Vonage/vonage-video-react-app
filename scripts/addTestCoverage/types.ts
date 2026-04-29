export type TestScope =
  | { type: 'last-commit' }
  | { type: 'working-tree' }
  | { type: 'path'; path: string };

export type PipelineContext = {
  testScope: TestScope | null;
  affectedFiles: string[] | null;
};

export type FilePipelineContext = {
  filePath: string;
  testScope: TestScope;
  fileContent: string | null;
};

export type PipelineStep<Context> = {
  name: string;
  execute: (context: Context) => Promise<StepExecutionResult>;
};

export type StepExecutionResult = {
  outputSummary: string;
  inputSummary: string;
};
