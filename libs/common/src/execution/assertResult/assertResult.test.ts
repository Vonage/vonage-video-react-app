import { describe, it, expect } from 'vitest';

import assertResult from './';
import ApplicationError from '@common/errors/ApplicationError';
import tryCatch from '../tryCatch';

describe('assertResult', () => {
  it('should return the result when callback succeeds', () => {
    const result = assertResult(() => 'success', {
      fallbackConfig: {
        statusCode: 500,
        fallbackMessage: 'This should not be used',
      },
    });

    expect(result).toBe('success');
  });

  it('should throw ApplicationError when callback throws', () => {
    const { error } = tryCatch(() => {
      assertResult(
        () => {
          throw new Error('Original error');
        },
        {
          fallbackConfig: {
            fallbackMessage: 'Operation failed',
            statusCode: 400,
          },
        }
      );
    });

    expect(error).toBeInstanceOf(ApplicationError);

    if (error instanceof ApplicationError) {
      expect(error.fallbackConfig.fallbackMessage).toBe('Operation failed');
      expect(error.fallbackConfig.statusCode).toBe(400);
    }
  });

  it('should handle async callbacks and reject with ApplicationError', async () => {
    const { error } = await tryCatch(async () => {
      await assertResult(
        (): Promise<void> => {
          throw new Error('Async original error');
        },
        {
          fallbackConfig: {
            fallbackMessage: 'Async operation failed',
            statusCode: 502,
          },
        }
      );
    });

    expect(error).toBeInstanceOf(ApplicationError);
    if (error instanceof ApplicationError) {
      expect(error.fallbackConfig.fallbackMessage).toBe('Async operation failed');
      expect(error.fallbackConfig.statusCode).toBe(502);
    }
  });
});
