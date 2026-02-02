import { describe, it, expect } from 'vitest';
import assertRecord from './assertRecord';

describe('assertRecord', () => {
  it('should not throw for valid record objects', () => {
    expect(() => assertRecord({ key: 'value' })).not.toThrow();
    expect(() => assertRecord({})).not.toThrow();
  });

  it('should throw TypeError for non-record values', () => {
    expect(() => assertRecord(null)).toThrow(TypeError);
    expect(() => assertRecord([])).toThrow(TypeError);
    expect(() => assertRecord(new Map())).toThrow(TypeError);
    expect(() => assertRecord('string')).toThrow(TypeError);
  });

  it('should use default error message when message is not provided', () => {
    expect(() => assertRecord(null)).toThrow(
      'Expected value to be a record Record<string, unknown>'
    );
  });

  it('should use custom error message when provided', () => {
    expect(() => assertRecord(null, 'Configuration must be an object')).toThrow(
      'Configuration must be an object'
    );
    expect(() => assertRecord([], 'Options should be a plain object')).toThrow(
      'Options should be a plain object'
    );
  });
});
