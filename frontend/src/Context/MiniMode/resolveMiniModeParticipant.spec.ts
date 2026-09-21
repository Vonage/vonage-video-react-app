import { describe, expect, it } from 'vitest';
import type { SubscriberWrapper } from '../../types/session';
import resolveMiniModeParticipant from './resolveMiniModeParticipant';

const makeWrapper = (id: string, name: string, isScreenshare = false): SubscriberWrapper =>
  ({
    id,
    isScreenshare,
    isPinned: false,
    element: { id } as unknown as HTMLVideoElement,
    subscriber: { stream: { name, initials: name.slice(0, 2) } },
  }) as SubscriberWrapper;

describe('resolveMiniModeParticipant', () => {
  const publisher = {
    element: { id: 'local' } as unknown as HTMLVideoElement,
    name: 'Me',
    initials: 'ME',
  };

  it('uses the active camera speaker when present', () => {
    const wrappers = [makeWrapper('a', 'Ann'), makeWrapper('b', 'Bob')];
    const participant = resolveMiniModeParticipant(wrappers, 'b', publisher);

    expect(participant.name).toBe('Bob');
    expect((participant.element as HTMLVideoElement).id).toBe('b');
  });

  it('skips screenshare wrappers and falls back to the first camera subscriber', () => {
    const wrappers = [makeWrapper('screen', 'Desk', true), makeWrapper('a', 'Ann')];
    const participant = resolveMiniModeParticipant(wrappers, 'screen', publisher);

    expect(participant.name).toBe('Ann');
  });

  it('uses the local publisher when there are no camera subscribers', () => {
    const participant = resolveMiniModeParticipant([], undefined, publisher);

    expect(participant.name).toBe('Me');
    expect((participant.element as HTMLVideoElement).id).toBe('local');
  });
});
