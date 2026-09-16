import { describe, it, expect } from 'vitest';
import StatusCodeEnum from 'status-code-enum';
import buildThirdPartyErrorHandler from './makeThirdPartyErrorHandler';

describe('buildThirdPartyErrorHandler', () => {
  it('should create handler that returns ApplicationServerError with 502 status', () => {
    const handler = buildThirdPartyErrorHandler('Custom message');
    const error = handler(new Error('Test error'));

    expect(error.statusCode).toBe(StatusCodeEnum.ServerErrorBadGateway);
  });

  it('should map third party errors to issues when enabled', () => {
    const handler = buildThirdPartyErrorHandler({
      fallbackMessage: 'Service error',
      mapThirdPartyErrors: true,
    });
    const error = handler(new Error('API error'));

    expect(error.exportSafely().issues).toEqual(['API error']);
  });

  it('should not map third party errors to issues when disabled', () => {
    const handler = buildThirdPartyErrorHandler({
      fallbackMessage: 'Service error',
      mapThirdPartyErrors: false,
    });
    const error = handler(new Error('API error'));

    expect(error.exportSafely().issues).toBeUndefined();
  });
});
