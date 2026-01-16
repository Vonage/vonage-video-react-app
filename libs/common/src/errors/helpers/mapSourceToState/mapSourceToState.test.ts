import { describe, it, expect } from 'vitest';
import mapSourceToState from './';
import ApplicationError from '../../ApplicationError';
import StatusCodeEnum from 'status-code-enum';

describe('mapSourceToState', () => {
  it('should map string to state with message', () => {
    const result = mapSourceToState('Error message');
    expect(result).toEqual({ message: 'Error message' });
  });

  it('should map ApplicationError to state', () => {
    const error = new ApplicationError({
      src: 'Test error',
      fallbackConfig: {
        fallbackMessage: 'Fallback',
        statusCode: StatusCodeEnum.ClientErrorBadRequest,
      },
    });

    const result = mapSourceToState(error);
    expect(result.message).toBe('Test error');
    expect(result.fallbackConfig).toBeDefined();
  });

  it('should return empty object for unknown types', () => {
    const result = mapSourceToState(123);
    expect(result).toEqual({});
  });
});
