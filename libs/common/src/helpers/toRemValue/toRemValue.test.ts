import { describe, expect, it } from 'vitest';
import toRemValue from './toRemValue';

describe('toRemValue', () => {
  it('should append rem unit', () => {
    expect(toRemValue(0.75)).toBe('0.75rem');
  });

  it('should support integer values', () => {
    expect(toRemValue(2)).toBe('2rem');
  });

  it('should preserve sign', () => {
    expect(toRemValue(-1)).toBe('-1rem');
  });
});
