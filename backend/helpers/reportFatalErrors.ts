import { isRecord } from '@common/assertions';

// Node prints an uncaught error's source line (the whole minified bundle) before its message, and
// VCR's startup log keeps only the last lines, so the one-line summary is printed last.
process.on('uncaughtException', (error) => {
  console.error(error.stack);
  console.error(`Fatal error: ${describeError(error)}`);
  process.exit(1);
});

function describeError(error: unknown): string {
  if (!(error instanceof Error)) return String(error);

  const issues =
    error.name !== 'ZodError' &&
    isRecord(error) &&
    Array.isArray(error.issues) &&
    error.issues.length > 0
      ? ` issues: ${JSON.stringify(error.issues)}`
      : '';
  const cause = error.cause === undefined ? '' : ` | cause: ${describeError(error.cause)}`;

  return `${error.name}: ${error.message}${issues}${cause}`.replace(/\s+/g, ' ');
}
