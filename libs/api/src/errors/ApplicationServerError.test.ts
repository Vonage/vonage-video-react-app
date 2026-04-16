import { describe, it, expect, afterEach } from 'vitest';
import StatusCodeEnum from 'status-code-enum';
import ApplicationServerError from './ApplicationServerError';

describe('ApplicationServerError', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should create error, add messages, assert, and chain methods', () => {
    const error = new ApplicationServerError({
      src: new Error('Test error'),
      fallbackConfig: {
        fallbackMessage: 'User friendly message',
        statusCode: StatusCodeEnum.ClientErrorBadRequest,
        severity: 'validation',
      },
    });

    error
      .add('Email is required')
      .add('Password too short')
      .setStatusCode(StatusCodeEnum.ClientErrorUnauthorized);

    expect(error.message).toBe('Test error');
    expect(error.severity).toBe('validation');
    expect(error.issues).toEqual(['Email is required', 'Password too short']);
    expect(error.statusCode).toBe(StatusCodeEnum.ClientErrorUnauthorized);
    expect(() => error.assert()).toThrow(ApplicationServerError);
  });

  it('should hide sensitive information in production mode', () => {
    process.env.NODE_ENV = 'production';

    const error = new ApplicationServerError({
      src: new Error('Internal database error'),
      fallbackConfig: {
        fallbackMessage: 'Something went wrong',
        statusCode: StatusCodeEnum.ServerErrorInternal,
      },
    });

    const exported = error.exportSafely();

    expect(exported.message).toBe('Something went wrong');
    expect(exported.stack).toBeUndefined();
    expect(exported.fallbackMessage).toBeUndefined();
    expect(exported.statusCode).toBe(StatusCodeEnum.ServerErrorInternal);
  });
});
