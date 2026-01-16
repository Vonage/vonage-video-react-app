import { describe, it, expect } from 'vitest';
import compareSubscriberByName from './compareSubscriberByName';
import type { SubscriberWrapper } from '../../types/session';

const makeWrapper = (name: string | undefined): SubscriberWrapper => {
  return {
    id: `test-id-${name}`,
    isScreenshare: false,
    isPinned: false,
    element: {} as unknown as HTMLVideoElement,
    subscriber: { stream: { name } } as SubscriberWrapper['subscriber'],
  } as SubscriberWrapper;
};

describe('compareSubscriberByName', () => {
  it('sorts alphabetically by name', () => {
    const a = makeWrapper('Alice');
    const b = makeWrapper('Bob');
    expect(compareSubscriberByName(a, b)).toBeLessThan(0);
    expect(compareSubscriberByName(b, a)).toBeGreaterThan(0);
  });

  it('treats undefined name as after defined names', () => {
    const a = makeWrapper(undefined);
    const b = makeWrapper('Bob');
    expect(compareSubscriberByName(a, b)).toBeGreaterThan(0);
  });

  it('treats defined name as before undefined names', () => {
    const a = makeWrapper('Alice');
    const b = makeWrapper(undefined);
    expect(compareSubscriberByName(a, b)).toBeLessThan(0);
  });

  it('returns 0 for equal names', () => {
    const a = makeWrapper('Chris');
    const b = makeWrapper('Chris');
    expect(compareSubscriberByName(a, b)).toBe(0);
  });
});
