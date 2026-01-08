import { describe, it, expect } from 'vitest';
import createNameMatcher from './createNameMatcher';

describe('createNameMatcher', () => {
  it('returns undefined for empty query', () => {
    expect(createNameMatcher('')).toBeUndefined();
    expect(createNameMatcher('   ')).toBeUndefined();
  });

  it('matches case-insensitively and by substring', () => {
    const m = createNameMatcher('ali');
    expect(m).toBeDefined();
    expect(m!('Alice')).toBe(true);
    expect(m!('ALICIA')).toBe(true);
    expect(m!('Bob')).toBe(false);
  });
});
