import { describe, it, expect } from 'vitest';
import StatusCodeEnum from 'status-code-enum';
import buildUnauthorizedErrorHandler from './makeUnauthorizedErrorHandler';

describe('buildUnauthorizedErrorHandler', () => {
  it('should create handler that returns ApplicationServerError with 401 status', () => {
    const handler = buildUnauthorizedErrorHandler('Custom message');
    const error = handler(new Error('Test error'));

    expect(error.statusCode).toBe(StatusCodeEnum.ClientErrorUnauthorized);
    expect(error.message).toBe('Test error');
  });
});
