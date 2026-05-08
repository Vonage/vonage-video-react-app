import { describe, it, expect } from 'vitest';
import assertNotNil from './assertNotNil';

describe('assertNotNil', () => {
  it('should not throw for a non-nil value', () => {
    expect(() => assertNotNil({ key: 'value' })).not.toThrow();
  });

  it('should throw for nil values with default message', () => {
    expect(() => assertNotNil(null)).toThrow(TypeError);
    expect(() => assertNotNil(undefined)).toThrow(
      'Expected value to be non-null and non-undefined'
    );
  });
});
