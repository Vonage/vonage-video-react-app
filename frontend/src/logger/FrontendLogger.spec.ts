import { waitFor } from '@testing-library/dom';
import { FrontendLogger } from './FrontendLogger';
import { type LoggerProviderConfig } from '@common/logger';

describe('FrontendLogger', () => {
  // TODO: add more use cases, when the setup is sync, when the setup fails, etc.
  // when the provider specific methods fails
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
});
