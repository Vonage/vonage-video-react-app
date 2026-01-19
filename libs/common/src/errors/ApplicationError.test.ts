import { describe, it, expect } from 'vitest';
import StatusCodeEnum from 'status-code-enum';
import ApplicationError from './ApplicationError';

describe('ApplicationError', () => {
  it('should create error, add messages, assert, and chain methods', () => {
    const error = new ApplicationError({
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
    expect(() => error.assert()).toThrow(ApplicationError);
  });

  it('should hide sensitive information in production mode', () => {
    const error = new ApplicationError({
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
