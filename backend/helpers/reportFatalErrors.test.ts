import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

type UncaughtExceptionHandler = (error: unknown) => void;

describe('reportFatalErrors', () => {
  let handler: UncaughtExceptionHandler;
  let errorLines: string[];
  let exitCode: number | undefined;

  beforeEach(async () => {
    vi.resetModules();

    errorLines = [];
    exitCode = undefined;

    vi.spyOn(process, 'on').mockImplementation(((event: string, listener: unknown) => {
      if (event === 'uncaughtException') handler = listener as UncaughtExceptionHandler;
      return process;
    }) as never);

    vi.spyOn(console, 'error').mockImplementation((line: unknown) => {
      errorLines.push(String(line));
    });

    vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      exitCode = code;
      return undefined as never;
    }) as never);

    await import('./reportFatalErrors');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('reports the error name, message and cause, then exits', () => {
    const cause = new TypeError('socket closed');
    const error = new Error('could not start', { cause });

    handler(error);

    expect(errorLines).toContain(
      'Fatal error: Error: could not start | cause: TypeError: socket closed'
    );
    expect(exitCode).toBe(1);
  });

  test('includes validation issues and collapses whitespace', () => {
    const error = Object.assign(new Error('bad\n  config'), {
      issues: [{ path: ['port'] }],
    });

    handler(error);

    expect(errorLines).toContain('Fatal error: Error: bad config issues: [{"path":["port"]}]');
  });

  test('describes a thrown non-error value', () => {
    handler('boom');

    expect(errorLines).toContain('Fatal error: boom');
  });
});
