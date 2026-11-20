// VS Code js-debug reads VSCODE_INSPECTOR_OPTIONS as ":::"-separated JSON segments; "autoAttachMode"
// overrides the editor's debug.javascript.autoAttachFilter for every process started with this environment.
const INSPECTOR_OPTIONS_SEPARATOR = ':::';

/** Forces the editor debugger to auto-attach to every Node process started with the returned environment. */
const withDebuggerAutoAttach = (environment: NodeJS.ProcessEnv): NodeJS.ProcessEnv => {
  const inspectorOptions = environment.VSCODE_INSPECTOR_OPTIONS;

  if (!inspectorOptions) return environment;

  const forcedInspectorOptions = inspectorOptions
    .split(INSPECTOR_OPTIONS_SEPARATOR)
    .map(forceAlwaysAttach)
    .join(INSPECTOR_OPTIONS_SEPARATOR);

  return { ...environment, VSCODE_INSPECTOR_OPTIONS: forcedInspectorOptions };
};

function forceAlwaysAttach(segment: string): string {
  if (!segment.startsWith('{')) return segment;

  try {
    return JSON.stringify({ ...JSON.parse(segment), autoAttachMode: 'always' });
  } catch {
    return segment;
  }
}

export default withDebuggerAutoAttach;
