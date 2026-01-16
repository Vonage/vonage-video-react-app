import { describe, it, expect } from 'vitest';
import getFilteredSubscribers from './getFilteredSubscribers';
import type { SubscriberWrapper } from '../../types/session';

const makeWrapper = (
  name: string | undefined,
  id: string,
  isScreenshare = false
): SubscriberWrapper => {
  return {
    id,
    isScreenshare,
    isPinned: false,
    element: {} as unknown as HTMLVideoElement,
    subscriber: { stream: { name } } as SubscriberWrapper['subscriber'],
  } as SubscriberWrapper;
};

describe('getFilteredSubscribers', () => {
  it('filters out screenshares and applies name match', () => {
    const data: SubscriberWrapper[] = [
      makeWrapper('Bob', '1'),
      makeWrapper('Alice', '2'),
      makeWrapper('Charlie', '3', true),
    ];

    const nameMatches = (n: string) => n.toLowerCase().includes('a');
    const result = getFilteredSubscribers({ subscriberWrappers: data, nameMatches });

    expect(result.map((w) => w.subscriber?.stream?.name)).toEqual(['Alice']);
  });

  it('sorts remaining by name ascending', () => {
    const data: SubscriberWrapper[] = [
      makeWrapper('Charlie', '3'),
      makeWrapper('Bob', '1'),
      makeWrapper('Alice', '2'),
    ];

    const result = getFilteredSubscribers({ subscriberWrappers: data });
    expect(result.map((w) => w.subscriber?.stream?.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });
});
