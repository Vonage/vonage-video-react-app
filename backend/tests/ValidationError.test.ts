import { describe, expect, it } from '@jest/globals';
import StatusCodeEnum from 'status-code-enum';
import { ValidationError, type ValidationIssue } from '../errors/ValidationError';

describe('ValidationError', () => {
  const sampleIssues: ValidationIssue[] = [
    { path: ['username'], message: 'Expected string, received number' },
    { path: ['favoriteNumbers', 1], message: 'Expected number, received string' },
  ];

  it('creates error with issues and default message', () => {
    const error = new ValidationError(sampleIssues);

    expect(error.issues).toEqual(sampleIssues);
    expect(error.message).toBe('Invalid request');
    expect(error.name).toBe('ValidationError');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(StatusCodeEnum.ClientErrorBadRequest);
  });

  it('creates error with issues and custom message', () => {
    const error = new ValidationError(sampleIssues, 'Validation failed');

    expect(error.issues).toEqual(sampleIssues);
    expect(error.message).toBe('Validation failed');
  });

  it('exportSafely returns structured response with code and issues', () => {
    const error = new ValidationError(sampleIssues);
    const safe = error.exportSafely();

    expect(safe).toMatchObject({
      code: 'VALIDATION_ERROR',
      issues: sampleIssues,
      statusCode: 400,
      severity: 'error',
    });
    expect(safe.message).toBeDefined();
  });

  it('is an instance of Error', () => {
    const error = new ValidationError(sampleIssues);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ValidationError);
  });

  it('handles empty issues array', () => {
    const error = new ValidationError([]);

    expect(error.issues).toEqual([]);
    expect(error.exportSafely().issues).toEqual([]);
  });
});
