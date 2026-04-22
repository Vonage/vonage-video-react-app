import { waitFor } from '@testing-library/dom';
import { LoggerBase as LoggerBaseClass, LoggerFeature, type LoggerProviderConfig } from './Logger';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const minimalProvider: LoggerProviderConfig = {
  [LoggerFeature.ReportError]: () => {},
  [LoggerFeature.Log]: () => {},
};

describe('LoggerBase', () => {
  let loggerBase: LoggerBaseClass;

  beforeEach(() => {
    loggerBase = new LoggerBaseClass();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warns and drops logs when no provider; logs go to provider after setup()', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    loggerBase.log('EarlyEvent', { sessionId: 's1' });
    loggerBase.reportError(new Error('Early error'), { source: 'test' });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No provider configured'));

    const provider = { ...minimalProvider, log: vi.fn(), reportError: vi.fn() };
    loggerBase.setup(() => provider);

    loggerBase.log('AfterSetup', { sessionId: 's2' });

    await waitFor(() => {
      expect(provider.log).toHaveBeenCalledWith(
        'AfterSetup',
        expect.objectContaining({ sessionId: 's2' })
      );
    });
    expect(provider.log).not.toHaveBeenCalledWith('EarlyEvent', expect.anything());
  });

  it('should warn if the provider is missing the feature', async () => {
    const fakeProviderMissingLog = {
      [LoggerFeature.ReportError]: () => {},
    } as unknown as LoggerProviderConfig;

    loggerBase.setup(() => fakeProviderMissingLog);
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    loggerBase.log('TestEvent');

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('The provider does not implement the log feature')
      );
    });
  });

  it('group() should return a new logger instance with group context', () => {
    const grouped = loggerBase.group('TestGroup', { extra: true });

    expect(grouped).not.toBe(loggerBase);
    expect(typeof grouped.log).toBe('function');
    expect(typeof grouped.reportError).toBe('function');
  });

  it('should handle rejected promise from setup gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const badProvider = () => Promise.reject(new Error('Failed to init'));

    const loggerBase = new LoggerBaseClass();

    loggerBase.setup(badProvider);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('group() reportError and log forward with group context', () => {
    it('should pass payload unchanged to provider', async () => {
      const provider = { ...minimalProvider, reportError: vi.fn(), log: vi.fn() };
      loggerBase.setup(() => provider);

      loggerBase.log('TestEvent', { sessionId: 's1' });

      await waitFor(() => {
        expect(provider.log).toHaveBeenCalledWith(
          'TestEvent',
          expect.objectContaining({ sessionId: 's1' })
        );
      });
    });

    it('should pass empty object when log() is called without extra', async () => {
      const provider = { ...minimalProvider, reportError: vi.fn(), log: vi.fn() };
      loggerBase.setup(() => provider);

      loggerBase.log('EventOnly');

      await waitFor(() => {
        expect(provider.log).toHaveBeenCalledWith('EventOnly', {});
      });
    });

    it('should forward reportError with groupId, groupName, context and extra', async () => {
      const provider = {
        ...minimalProvider,
        reportError: vi.fn(),
        log: vi.fn(),
      };

      loggerBase.setup(() => provider);
      const grouped = loggerBase.group('CallSession', { sessionId: 's1' });
      const err = new Error('Group error');
      grouped.reportError(err, { detail: 'user action' });

      await waitFor(() => {
        expect(provider.reportError).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'Group error' }),
          expect.objectContaining({
            groupId: expect.any(String),
            groupName: 'CallSession',
            context: { sessionId: 's1' },
            extra: { detail: 'user action' },
          })
        );
      });
    });

    it('should forward log with groupId, groupName, context and extra', async () => {
      const provider = {
        ...minimalProvider,
        reportError: vi.fn(),
        log: vi.fn(),
      };

      loggerBase.setup(() => provider);
      const grouped = loggerBase.group('CallSession', { sessionId: 's1' });
      grouped.log('UserAction', { action: 'mute' });

      await waitFor(() => {
        expect(provider.log).toHaveBeenCalledWith(
          'UserAction',
          expect.objectContaining({
            groupId: expect.any(String),
            groupName: 'CallSession',
            context: { sessionId: 's1' },
            extra: { action: 'mute' },
          })
        );
      });
    });
  });

  describe('reportError', () => {
    it('should pass normalized error (message, name, stack) to provider when error is Error-like', async () => {
      const provider = { ...minimalProvider, reportError: vi.fn(), log: vi.fn() };
      loggerBase.setup(() => provider);

      const err = new Error('Something failed');
      loggerBase.reportError(err, { source: 'test' });

      await waitFor(() => {
        expect(provider.reportError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Something failed',
            name: 'Error',
            stack: expect.any(String),
          }),
          { source: 'test' }
        );
      });
    });

    it('should pass raw error to provider when error is not Error-like', async () => {
      const provider = { ...minimalProvider, reportError: vi.fn(), log: vi.fn() };
      loggerBase.setup(() => provider);

      const raw = 'something went wrong';
      loggerBase.reportError(raw, { code: 500 });

      await waitFor(() => {
        expect(provider.reportError).toHaveBeenCalledWith(raw, { code: 500 });
      });
    });

    it('should pass empty object as extra when extra is omitted', async () => {
      const provider = { ...minimalProvider, reportError: vi.fn(), log: vi.fn() };
      loggerBase.setup(() => provider);

      loggerBase.reportError(new Error('E'));

      await waitFor(() => {
        expect(provider.reportError).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'E' }),
          {}
        );
      });
    });
  });

  describe('logLoggerEvent (when provider has verbose: true)', () => {
    it('should log formatted event to console when log() is called', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const verboseProvider: LoggerProviderConfig = {
        ...minimalProvider,
        verbose: true,
      };

      loggerBase.setup(() => verboseProvider);
      loggerBase.log('TestEvent', { key: 'value' });

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalled();
      });
    });

    it('should log formatted error to console when reportError() is called', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const verboseProvider: LoggerProviderConfig = {
        ...minimalProvider,
        verbose: true,
      };

      loggerBase.setup(() => verboseProvider);
      loggerBase.reportError(new Error('Test error'), { context: 'spec' });

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[Logger] reportError'));
      });
    });

    it('should use fallback when formatting fails (e.g. circular reference)', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const verboseProvider: LoggerProviderConfig = {
        ...minimalProvider,
        verbose: true,
      };
      const circular: Record<string, unknown> = { name: 'circular' };
      circular.self = circular;

      loggerBase.setup(() => verboseProvider);
      loggerBase.reportError(new Error('E'), circular);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('<unable to format data>')
        );
      });
    });
  });

  describe('setContext / clearContext', () => {
    it('merges context into log() calls automatically', async () => {
      const provider = { ...minimalProvider, log: vi.fn() };
      loggerBase.setup(() => provider);

      loggerBase.setContext({ userId: 'u1', sessionId: 's1' });
      loggerBase.log('TestEvent');

      await waitFor(() => {
        expect(provider.log).toHaveBeenCalledWith(
          'TestEvent',
          expect.objectContaining({ userId: 'u1', sessionId: 's1' })
        );
      });
    });

    it('merges context into reportError() calls automatically', async () => {
      const provider = { ...minimalProvider, reportError: vi.fn() };
      loggerBase.setup(() => provider);

      loggerBase.setContext({ userId: 'u1', connectionId: 'c1' });
      loggerBase.reportError(new Error('oops'));

      await waitFor(() => {
        expect(provider.reportError).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'oops' }),
          expect.objectContaining({ userId: 'u1', connectionId: 'c1' })
        );
      });
    });

    it('extra passed to log() takes precedence over context', async () => {
      const provider = { ...minimalProvider, log: vi.fn() };
      loggerBase.setup(() => provider);

      loggerBase.setContext({ sessionId: 'from-context' });
      loggerBase.log('TestEvent', { sessionId: 'from-extra' });

      await waitFor(() => {
        expect(provider.log).toHaveBeenCalledWith(
          'TestEvent',
          expect.objectContaining({ sessionId: 'from-extra' })
        );
      });
    });

    it('clearContext() removes context from subsequent log() calls', async () => {
      const provider = { ...minimalProvider, log: vi.fn() };
      loggerBase.setup(() => provider);

      loggerBase.setContext({ userId: 'u1' });
      loggerBase.clearContext();
      loggerBase.log('TestEvent');

      await waitFor(() => {
        expect(provider.log).toHaveBeenCalledWith('TestEvent', {});
      });
    });

    it('setContext() merges with previously set context fields', async () => {
      const provider = { ...minimalProvider, log: vi.fn() };
      loggerBase.setup(() => provider);

      loggerBase.setContext({ userId: 'u1' });
      loggerBase.setContext({ sessionId: 's1' });
      loggerBase.log('TestEvent');

      await waitFor(() => {
        expect(provider.log).toHaveBeenCalledWith(
          'TestEvent',
          expect.objectContaining({ userId: 'u1', sessionId: 's1' })
        );
      });
    });
  });

  describe('setup with synchronous callback returning invalid result', () => {
    it.each([
      ['null', () => null],
      ['undefined', () => undefined],
    ])('fails setup when callback returns %s', (_label, callback) => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      loggerBase.setup(callback as unknown as () => LoggerProviderConfig);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Initialization failed'),
        expect.any(Error)
      );

      expect(loggerBase['provider']).toBeNull();
    });

    it('fails setup when callback throws', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const thrownError = new Error('Setup threw');

      loggerBase.setup(() => {
        throw thrownError;
      });

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Initialization failed'),
        thrownError
      );

      expect(loggerBase['provider']).toBeNull();
    });
  });
});
