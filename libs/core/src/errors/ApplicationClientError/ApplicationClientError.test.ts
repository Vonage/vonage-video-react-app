import { describe, it, expect } from 'vitest';
import ApplicationClientError from './ApplicationClientError';
import { StatusCode } from 'status-code-enum';

describe('ApplicationClientError', () => {
  it('should create an instance with the correct properties', () => {
    const error = new ApplicationClientError({
      src: {
        type: 'server_error',
        message: 'Invalid credentials',
        fallbackMessage: 'Please check your input',
        statusCode: StatusCode.ClientErrorBadRequest,
      },
      fallbackConfig: {
        fallbackMessage: 'Fallback',
      },
    });

    expect(error.type).toBe('server_error');
    expect(error.message).toBe('Invalid credentials');
    expect(error.fallbackMessage).toBe('Invalid credentials');

    const exported = error.exportSafely();

    expect(exported.message).toBe('Invalid credentials');
    expect(exported.type).toBe('server_error');
    expect(exported.statusCode).toBe(StatusCode.ClientErrorBadRequest);
  });
});
