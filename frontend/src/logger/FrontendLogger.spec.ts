import { waitFor } from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FrontendLogger } from './FrontendLogger';
import { type LoggerProviderConfig } from '@common/logger';

describe('FrontendLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs events via LoggerBase', () => {
    expect.assertions(3);

    const provider: LoggerProviderConfig = {
      verbose: true,
      log: vi.fn(),
      reportError: vi.fn(),
    };

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const logger = new FrontendLogger();

    logger.setup(() => Promise.resolve(provider));

    logger.log('CallStarted', { sessionId: '123', connectionId: '456' });

    waitFor(() => {
      expect(provider.log).toHaveBeenCalledWith(
        'CallStarted',
        expect.objectContaining({ sessionId: '123', connectionId: '456' })
      );
    });

    logger.reportError(new Error('Test error'), { type: 'test' });

    waitFor(() => {
      expect(provider.reportError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Test error' }),
        expect.objectContaining({ type: 'test' })
      );
    });

    waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });
  });

  it('forwards log and reportError when setup is sync', async () => {
    const provider: LoggerProviderConfig = {
      verbose: false,
      log: vi.fn(),
      reportError: vi.fn(),
    };

    const logger = new FrontendLogger();
    logger.setup(() => provider);

    logger.log('SyncEvent', { id: '1' });
    logger.reportError(new Error('Sync error'), { source: 'test' });

    await waitFor(() => {
      expect(provider.log).toHaveBeenCalledWith('SyncEvent', expect.objectContaining({ id: '1' }));
    });
    await waitFor(() => {
      expect(provider.reportError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Sync error' }),
        expect.objectContaining({ source: 'test' })
      );
    });
  });

  it('reports initialization failure when setup fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const logger = new FrontendLogger();
    logger.setup(() => Promise.reject(new Error('Failed to load provider')));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Initialization failed'),
        expect.any(Error)
      );
    });
  });

  it('when provider methods are called, they receive the correct arguments', async () => {
    const provider: LoggerProviderConfig = {
      log: vi.fn(),
      reportError: vi.fn(),
    };

    const logger = new FrontendLogger();
    logger.setup(() => Promise.resolve(provider));

    logger.log('EventName', { key: 'value' });
    logger.reportError(new Error('Err'), { context: 'test' });

    await waitFor(() => {
      expect(provider.log).toHaveBeenCalledWith('EventName', { key: 'value' });
    });
    await waitFor(() => {
      expect(provider.reportError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Err' }),
        {
          context: 'test',
        }
      );
    });
  });
});
