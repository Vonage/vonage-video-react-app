import { describe, expect, it } from 'vitest';
import { SubscriberWrapper } from '../../types/session';
import sortByDisplayPriority from './sortByDisplayPriority';

describe('sortByDisplayPriority', () => {
  it('prioritizes subscribers in priority order', () => {
    const subA = { id: 'subA', isScreenshare: true } as SubscriberWrapper;
    const subB = { id: 'subB', isScreenshare: false, isPinned: true } as SubscriberWrapper;
    const subC = { id: 'subC', isScreenshare: false, isPinned: true } as SubscriberWrapper;
    const subD = { id: 'subD' } as SubscriberWrapper;
    const subE = { id: 'subE' } as SubscriberWrapper;

    const sortedSubs = [subE, subD, subC, subB, subA].sort(sortByDisplayPriority('subD'));
    expect(sortedSubs).toEqual([subA, subC, subB, subD, subE]);
  });

  describe('with screenshare subscribers', () => {
    it('properly prioritizes subA', () => {
      const subA = { id: 'subA', isScreenshare: true } as SubscriberWrapper;
      const subB = { id: 'subB', isScreenshare: false } as SubscriberWrapper;

      const sortedSubs = [subA, subB].sort(sortByDisplayPriority(undefined));
      expect(sortedSubs[0].id).toBe('subA');
    });

    it('properly prioritizes subB', () => {
      const subA = { id: 'subA', isScreenshare: false } as SubscriberWrapper;
      const subB = { id: 'subB', isScreenshare: true } as SubscriberWrapper;

      const sortedSubs = [subA, subB].sort(sortByDisplayPriority(undefined));
      expect(sortedSubs[0].id).toBe('subB');
    });
  });

  describe('with an active speaker', () => {
    it('properly prioritizes subA', () => {
      const subA = { id: 'subA' } as SubscriberWrapper;
      const subB = { id: 'subB' } as SubscriberWrapper;

      const sortedSubs = [subA, subB].sort(sortByDisplayPriority('subA'));
      expect(sortedSubs[0].id).toBe('subA');
    });

    it('properly prioritizes subB', () => {
      const subA = { id: 'subA' } as SubscriberWrapper;
      const subB = { id: 'subB' } as SubscriberWrapper;

      const sortedSubs = [subA, subB].sort(sortByDisplayPriority('subB'));
      expect(sortedSubs[0].id).toBe('subB');
    });
  });

  it('prioritizes pinned participant over active speaker', () => {
    const subA = { id: 'subA', isPinned: true } as SubscriberWrapper;
    const subB = { id: 'subB' } as SubscriberWrapper;

    const sortedSubs = [subA, subB].sort(sortByDisplayPriority('subB'));
    expect(sortedSubs[0].id).toBe('subA');
  });

  it('prioritizes screenshare participant over pinned participant', () => {
    const subA = { id: 'subA', isScreenshare: true } as SubscriberWrapper;
    const subB = { id: 'subB', isPinned: true } as SubscriberWrapper;

    const sortedSubs = [subA, subB].sort(sortByDisplayPriority(undefined));
    expect(sortedSubs[0].id).toBe('subA');
  });

  it('does not change order if neither sub is an active speaker or screenshare', () => {
    const subA = { id: 'subA' } as SubscriberWrapper;
    const subB = { id: 'subB' } as SubscriberWrapper;

    const sortedSubs = [subA, subB].sort(sortByDisplayPriority(undefined));
    expect(sortedSubs[0].id).toBe('subA');
  });
});
