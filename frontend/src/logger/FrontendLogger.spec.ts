import { FrontendLogger } from './FrontendLogger';
import { LoggerBase } from '@common/logger';

vi.mock('@common/logger/LoggerBase', () => {
  return {
    LoggerBase: class {
      log = vi.fn();
    },
  };
});

describe('FrontendLogger', () => {
  it('logs events via LoggerBase', () => {
    const baseLogSpy = vi.spyOn(LoggerBase.prototype, 'log');

    const logger = new FrontendLogger();

    logger.log('CallStarted', { sessionId: '123', connectionId: '456' });

    expect(baseLogSpy).toHaveBeenCalledWith(
      'CallStarted',
      expect.objectContaining({ sessionId: '123', connectionId: '456' })
    );

    baseLogSpy.mockRestore();
  });

  it('does not throw when payload is undefined', () => {
    const logger = new FrontendLogger();

    expect(() => logger.log('CallStarted', undefined)).not.toThrow();
  });
});
