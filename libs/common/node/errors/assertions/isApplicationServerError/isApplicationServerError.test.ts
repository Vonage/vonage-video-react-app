import { describe, it, expect } from 'vitest';
import StatusCodeEnum from 'status-code-enum';
import isApplicationServerError from './isApplicationServerError';
import ApplicationServerError from '../../ApplicationServerError';

describe('isApplicationServerError', () => {
  it('should return true for ApplicationServerError instances', () => {
    const error = new ApplicationServerError({
      src: new Error('Test error'),
      fallbackConfig: {
        fallbackMessage: 'Something went wrong',
        statusCode: StatusCodeEnum.ServerErrorInternal,
      },
    });

    expect(isApplicationServerError(error)).toBe(true);
  });

  it('should return false for non-ApplicationServerError values', () => {
    expect(isApplicationServerError(new Error('Regular error'))).toBe(false);
    expect(isApplicationServerError(null)).toBe(false);
    expect(isApplicationServerError({ message: 'error' })).toBe(false);
  });
});
