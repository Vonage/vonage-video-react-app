import { describe, it, expect } from 'vitest';
import StatusCodeEnum from 'status-code-enum';
import mapServerSourceToState from './mapServerSourceToState';
import ApplicationServerError from '../../ApplicationServerError';

describe('mapServerSourceToState', () => {
  it('should map ApplicationServerError to state', () => {
    const error = new ApplicationServerError({
      src: new Error('Original error'),
      fallbackConfig: {
        fallbackMessage: 'Something went wrong',
        statusCode: StatusCodeEnum.ServerErrorInternal,
        severity: 'error',
      },
    });

    const state = mapServerSourceToState(error);

    expect(state.message).toBe('Original error');
    expect(state.statusCode).toBe(StatusCodeEnum.ServerErrorInternal);
  });

  it('should map various error types to state', () => {
    expect(mapServerSourceToState(new Error('Test')).message).toBe('Test');
    expect(mapServerSourceToState('String error').message).toBe('String error');
    expect(mapServerSourceToState({ message: 'Object error' }).message).toBe('Object error');
  });
});
