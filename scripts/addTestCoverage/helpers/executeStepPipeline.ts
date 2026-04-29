import getReadableErrorMessage from './getReadableErrorMessage';
import type { PipelineStep, StepExecutionResult } from '../types';

type ExecuteStepPipelineArgs<Context> = {
  context: Context;
  steps: PipelineStep<Context>[];
  label?: string;
};

async function executeStepPipeline<Context>(args: ExecuteStepPipelineArgs<Context>): Promise<void> {
  const { context, steps, label } = args;

  for (const [stepIndex, pipelineStep] of steps.entries()) {
    await executeMonitoredStep({
      context,
      pipelineStep,
      stepIndex: stepIndex + 1,
      label,
    });
  }
}

type ExecuteMonitoredStepArgs<Context> = {
  context: Context;
  pipelineStep: PipelineStep<Context>;
  stepIndex: number;
  label?: string;
};

async function executeMonitoredStep<Context>(
  args: ExecuteMonitoredStepArgs<Context>
): Promise<void> {
  const { context, pipelineStep, stepIndex, label } = args;
  const contextBeforeStep = serializeContext(context);

  try {
    const stepExecutionResult = await pipelineStep.execute(context);
    const contextAfterStep = serializeContext(context);

    logStepReport({
      contextAfterStep,
      contextBeforeStep,
      stepExecutionResult,
      pipelineStep,
      status: 'success',
      stepIndex,
      label,
    });
  } catch (error) {
    const contextAfterStep = serializeContext(context);

    logStepReport({
      contextAfterStep,
      contextBeforeStep,
      error,
      pipelineStep,
      status: 'failed',
      stepIndex,
      label,
    });

    throw error;
  }
}

type LogStepReportArgs<Context> = {
  contextAfterStep: string;
  contextBeforeStep: string;
  error?: unknown;
  pipelineStep: PipelineStep<Context>;
  stepExecutionResult?: StepExecutionResult;
  status: 'success' | 'failed';
  stepIndex: number;
  label?: string;
};

function logStepReport<Context>(args: LogStepReportArgs<Context>): void {
  const {
    contextAfterStep,
    contextBeforeStep,
    error,
    pipelineStep,
    stepExecutionResult,
    status,
    stepIndex,
    label,
  } = args;

  const prefix = label ? `[${label}] ` : '';

  const reportLines = [
    `${prefix}Segment: ${stepIndex}`,
    `${prefix}Step: ${pipelineStep.name}`,
    `${prefix}Status: ${status}`,
    '',
    'Input:',
    contextBeforeStep,
    '',
    'Output:',
    contextAfterStep,
    '',
    'Step Input:',
    stepExecutionResult?.inputSummary ?? 'Unavailable due to early failure.',
    '',
    'Step Output:',
    stepExecutionResult?.outputSummary ?? 'Unavailable due to early failure.',
  ];

  if (error) {
    reportLines.push('', `Error: ${getReadableErrorMessage(error)}`);
  }

  console.log(reportLines.join('\n'));
}

function serializeContext<Context>(context: Context): string {
  return JSON.stringify(context, null, 2);
}

export default executeStepPipeline;
