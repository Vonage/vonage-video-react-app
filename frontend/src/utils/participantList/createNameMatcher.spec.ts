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

  it('matches names such as Ramòn when searched for Ramon', () => {
    const m = createNameMatcher('ramòn');
    expect(m).toBeDefined();
    expect(m!('Ramon')).toBe(true);
    expect(m!('Ramòn')).toBe(true);
    expect(m!('Rámón')).toBe(true);
    expect(m!('Bob')).toBe(false);
  });
});
