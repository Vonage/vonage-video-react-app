import { describe, it, expect } from 'vitest';
import shouldShowYou from './shouldShowYou';

describe('shouldShowYou', () => {
  it('returns true when matcher is undefined', () => {
    expect(shouldShowYou(undefined, 'Alice')).toBe(true);
  });

  it('returns true when your name matches', () => {
    const m = (n: string) => n.toLowerCase().includes('ali');
    expect(shouldShowYou(m, 'Alice')).toBe(true);
  });

  it('returns false when your name does not match', () => {
    const m = (n: string) => n.toLowerCase().includes('bob');
    expect(shouldShowYou(m, 'Alice')).toBe(false);
  });
});
