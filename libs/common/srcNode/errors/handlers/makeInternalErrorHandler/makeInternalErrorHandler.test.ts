import { describe, it, expect } from 'vitest';
import StatusCodeEnum from 'status-code-enum';
import buildInternalErrorHandler from './makeInternalErrorHandler';

describe('buildInternalErrorHandler', () => {
  it('should create handler that returns ApplicationServerError with 500 status', () => {
    const handler = buildInternalErrorHandler('Custom message');
    const error = handler(new Error('Test error'));

    expect(error.statusCode).toBe(StatusCodeEnum.ServerErrorInternal);
    expect(error.message).toBe('Test error');
  });
});
