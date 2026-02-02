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

  it('should set provider when setup is called with valid provider', async () => {
    await loggerBase.setup(() => Promise.resolve(minimalProvider));

    expect(loggerBase['provider']).not.toBeNull();
  });

  it('should warn if provider not set when log is called', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    loggerBase.log('TestEvent', { key: 'value' });

    await Promise.resolve();

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No provider configured'));
  });

  it('should warn if the provider is missing the feature', async () => {
    const fakeProviderMissingLog = {
      [LoggerFeature.ReportError]: () => {},
    } as unknown as LoggerProviderConfig;

    await loggerBase.setup(() => fakeProviderMissingLog);
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    loggerBase.log('TestEvent');

    await Promise.resolve();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('The provider does not implement the log feature')
    );
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
    await loggerBase.setup(badProvider);

    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Initialization failed');
    expect(consoleErrorSpy.mock.calls[0][1]).toBeInstanceOf(Error);
  });
});
