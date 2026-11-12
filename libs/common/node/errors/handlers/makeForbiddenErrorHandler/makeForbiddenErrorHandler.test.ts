import { describe, it, expect } from 'vitest';
import StatusCodeEnum from 'status-code-enum';
import buildForbiddenErrorHandler from './makeForbiddenErrorHandler';

describe('buildForbiddenErrorHandler', () => {
  it('should create handler that returns ApplicationServerError with 403 status', () => {
    const handler = buildForbiddenErrorHandler('Custom message');
    const error = handler(null);

    expect(error.statusCode).toBe(StatusCodeEnum.ClientErrorForbidden);
  });
});
