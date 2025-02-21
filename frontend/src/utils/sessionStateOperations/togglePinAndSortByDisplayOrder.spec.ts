import { describe, expect, it } from 'vitest';
import { SubscriberWrapper } from '../../types/session';
import togglePinAndSortByDisplayOrder from './togglePinAndSortByDisplayOrder';

describe('togglePinAndSortByDisplayOrder', () => {
  it('pins subscriber and moves to top', () => {
    const previousSubscriberWrappers = [
      { id: 'subA', isScreenshare: false, isPinned: false },
      { id: 'subB', isScreenshare: false, isPinned: false },
      { id: 'subC', isScreenshare: false, isPinned: false },
      { id: 'subD', isScreenshare: false, isPinned: false },
      { id: 'subE', isScreenshare: false, isPinned: false },
    ] as SubscriberWrapper[];

    const sortedSubs = togglePinAndSortByDisplayOrder(
      'subD',
      previousSubscriberWrappers,
      undefined
    );
    expect(sortedSubs[0]).toEqual({ id: 'subD', isPinned: true, isScreenshare: false });
  });

  it('unpins subscriber and does not change order', () => {
    const previousSubscriberWrappers = [
      { id: 'subA', isScreenshare: false, isPinned: true },
      { id: 'subB', isScreenshare: false, isPinned: false },
      { id: 'subC', isScreenshare: false, isPinned: false },
      { id: 'subD', isScreenshare: false, isPinned: false },
      { id: 'subE', isScreenshare: false, isPinned: false },
    ] as SubscriberWrapper[];

    const sortedSubs = togglePinAndSortByDisplayOrder(
      'subA',
      previousSubscriberWrappers,
      undefined
    );
    expect(sortedSubs[0]).toEqual({ id: 'subA', isPinned: false, isScreenshare: false });
  });

  it('pins subscriber and moves to top below screenshare', () => {
    const previousSubscriberWrappers = [
      { id: 'subA', isScreenshare: true, isPinned: false },
      { id: 'subB', isScreenshare: false, isPinned: false },
      { id: 'subC', isScreenshare: false, isPinned: false },
      { id: 'subD', isScreenshare: false, isPinned: false },
      { id: 'subE', isScreenshare: false, isPinned: false },
    ] as SubscriberWrapper[];

    const sortedSubs = togglePinAndSortByDisplayOrder(
      'subD',
      previousSubscriberWrappers,
      undefined
    );
    expect(sortedSubs[1]).toEqual({ id: 'subD', isPinned: true, isScreenshare: false });
  });

  it('pins subscriber and moves to top below screenshare above active speaker', () => {
    const previousSubscriberWrappers = [
      { id: 'subA', isScreenshare: true, isPinned: false },
      { id: 'subB', isScreenshare: false, isPinned: false },
      { id: 'subC', isScreenshare: false, isPinned: false },
      { id: 'subD', isScreenshare: false, isPinned: false },
      { id: 'subE', isScreenshare: false, isPinned: false },
    ] as SubscriberWrapper[];

    const sortedSubs = togglePinAndSortByDisplayOrder('subD', previousSubscriberWrappers, 'subB');
    expect(sortedSubs[0].id).toBe('subA');
    expect(sortedSubs[1]).toEqual({ id: 'subD', isPinned: true, isScreenshare: false });
    expect(sortedSubs[2].id).toBe('subB');
  });

  it('unpins subscriber and moves it below screenshare and active speaker', () => {
    const previousSubscriberWrappers = [
      { id: 'subA', isScreenshare: true, isPinned: false },
      { id: 'subB', isScreenshare: false, isPinned: true },
      { id: 'subC', isScreenshare: false, isPinned: false },
      { id: 'subD', isScreenshare: false, isPinned: false },
      { id: 'subE', isScreenshare: false, isPinned: false },
    ] as SubscriberWrapper[];

    const sortedSubs = togglePinAndSortByDisplayOrder('subB', previousSubscriberWrappers, 'subC');
    expect(sortedSubs[0].id).toBe('subA');
    expect(sortedSubs[1].id).toBe('subC');
    expect(sortedSubs[2]).toEqual({ id: 'subB', isPinned: false, isScreenshare: false });
  });
});
