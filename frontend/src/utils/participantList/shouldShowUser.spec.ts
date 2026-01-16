import { describe, it, expect } from 'vitest';
import shouldShowUser from './shouldShowUser';

describe('shouldShowUser', () => {
  it('returns true when matcher is undefined', () => {
    expect(shouldShowUser(undefined, 'Alice')).toBe(true);
  });

  it('returns true when your name matches', () => {
    const m = (n: string) => n.toLowerCase().includes('ali');
    expect(shouldShowUser(m, 'Alice')).toBe(true);
  });

  it('returns false when your name does not match', () => {
    const m = (n: string) => n.toLowerCase().includes('bob');
    expect(shouldShowUser(m, 'Alice')).toBe(false);
  });
});
