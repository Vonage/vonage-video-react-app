import { waitFor } from '@testing-library/dom';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { FrontendLogger } from './FrontendLogger';
import type { LoggerProviderConfig } from '@common/logger';

describe('FrontendLogger', () => {
  let provider: LoggerProviderConfig;
  let logger: FrontendLogger;

  beforeEach(() => {
    provider = { log: vi.fn(), reportError: vi.fn(), verbose: false };
    logger = new FrontendLogger();
    logger.setup(() => provider);
    vi.clearAllMocks();
  });

  it('forwards log and reportError calls to provider', async () => {
    logger.log('EventName', { key: 'value' });
    logger.reportError(new Error('Err'), { context: 'test' });

    await waitFor(() => {
      expect(provider.log).toHaveBeenCalledWith(
        'EventName',
        expect.objectContaining({ key: 'value' })
      );
    });
    await waitFor(() => {
      expect(provider.reportError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Err' }),
        { context: 'test' }
      );
    });
  });

  it('handles synchronous setup correctly', async () => {
    const syncProvider: LoggerProviderConfig = { log: vi.fn(), reportError: vi.fn() };
    const syncLogger = new FrontendLogger();
    syncLogger.setup(() => syncProvider);

    syncLogger.log('SyncEvent', { id: '1' });
    syncLogger.reportError(new Error('Sync error'), { source: 'test' });

    await waitFor(() => {
      expect(syncProvider.log).toHaveBeenCalledWith(
        'SyncEvent',
        expect.objectContaining({ id: '1' })
      );
    });
    await waitFor(() => {
      expect(syncProvider.reportError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Sync error' }),
        { source: 'test' }
      );
    });
  });

  it('reports initialization failure when setup promise rejects', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const badLogger = new FrontendLogger();

    badLogger.setup(() => Promise.reject(new Error('Failed to load provider')));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Initialization failed'),
        expect.any(Error)
      );
    });
  });

  it('logs to console when provider is verbose', async () => {
    provider.verbose = true;
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    logger.log('VerboseEvent', { test: 1 });
    logger.reportError(new Error('VerboseError'), { type: 'test' });

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  it.each([
    ['onCaughtError', 'caught', { componentStack: 'stack1' }, { componentStack: 'stack1' }],
    ['onUncaughtError', 'uncaught', { componentStack: 'stack2' }, { componentStack: 'stack2' }],
    ['onUncaughtError', 'uncaught', undefined, { componentStack: undefined }],
    [
      'onRecoverableError',
      'recoverable',
      { componentStack: 'stack3' },
      { componentStack: 'stack3' },
    ],
    ['onRecoverableError', 'recoverable', {}, { componentStack: undefined }],
  ])('%s calls reportError with type "%s"', async (_method, type, errorInfoArg, expectedExtra) => {
    const err = new Error('Test error');
    const loggerWithCallbacks = logger as unknown as Record<
      string,
      (e: unknown, info: unknown) => void
    >;
    loggerWithCallbacks[_method](err, errorInfoArg);

    await waitFor(() => {
      expect(provider.reportError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Test error' }),
        { type, ...expectedExtra }
      );
    });
  });
});
