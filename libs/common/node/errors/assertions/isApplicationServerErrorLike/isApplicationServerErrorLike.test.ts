import { describe, it, expect } from 'vitest';
import StatusCodeEnum from 'status-code-enum';
import isApplicationServerErrorLike from './isApplicationServerErrorLike';
import ApplicationServerError from '../../ApplicationServerError';

describe('isApplicationServerErrorLike', () => {
  it('should return true for objects with message property', () => {
    const error = new ApplicationServerError({
      src: new Error('Test error'),
      fallbackConfig: {
        fallbackMessage: 'Something went wrong',
        statusCode: StatusCodeEnum.ServerErrorInternal,
      },
    });

    expect(isApplicationServerErrorLike(error)).toBe(true);
    expect(isApplicationServerErrorLike({ message: 'Error message' })).toBe(true);
    expect(isApplicationServerErrorLike(new Error('Standard error'))).toBe(true);
  });

  it('should return false for objects without message property', () => {
    expect(isApplicationServerErrorLike({})).toBe(false);
    expect(isApplicationServerErrorLike(null)).toBe(false);
    expect(isApplicationServerErrorLike('error message')).toBe(false);
  });
});
