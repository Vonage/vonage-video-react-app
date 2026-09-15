import { describe, it, expect } from 'vitest';
import StatusCodeEnum from 'status-code-enum';
import makeBadRequestErrorHandler from './makeBadRequestErrorHandler';

describe('makeBadRequestErrorHandler', () => {
  it('should create handler that returns ApplicationServerError with 400 status', () => {
    const handler = makeBadRequestErrorHandler('Custom message');
    const error = handler(new Error('Test error'));

    expect(error.statusCode).toBe(StatusCodeEnum.ClientErrorBadRequest);
    expect(error.message).toBe('Test error');
  });
});
