import { describe, it, expect } from 'vitest';
import StatusCodeEnum from 'status-code-enum';
import isApplicationError from './';
import ApplicationError from '../../ApplicationError';
import { ApplicationErrorState } from '@common/errors/types';

describe('isApplicationError', () => {
  it('should return true for ApplicationError instances', () => {
    const appError = new ApplicationError({
      src: new Error('Test error'),
      fallbackConfig: {
        fallbackMessage: 'User friendly message',
        statusCode: StatusCodeEnum.ServerErrorInternal,
      },
    });

    expect(isApplicationError(appError)).toBe(true);
  });

  it('should return true for objects with fallbackConfig', () => {
    const plainObject: ApplicationErrorState = {
      issues: [],
      message: 'Test error',
      statusCode: StatusCodeEnum.ServerErrorInternal,
      severity: 'error',
      stack: 'stack trace',
      fallbackConfig: {
        fallbackMessage: 'User friendly message',
        statusCode: 500,
      },
    };

    expect(isApplicationError(plainObject)).toBe(true);
  });

  it('should return false for non-application errors', () => {
    expect(isApplicationError(new Error('test'))).toBe(false);
    expect(isApplicationError({ message: 'error' })).toBe(false);
    expect(isApplicationError({ fallbackConfig: null })).toBe(false);
    expect(isApplicationError('error')).toBe(false);
    expect(isApplicationError(null)).toBe(false);
    expect(isApplicationError(undefined)).toBe(false);
  });
});
