import { describe, expect, it, vi } from 'vitest';
import { MutableRefObject } from 'react';
import { Publisher } from '@vonage/client-sdk-video';
import getLayoutBoxes, { GetLayoutBoxesProps } from './getLayoutBoxes';
import { SubscriberWrapper } from '../../../types/session';

vi.mock('./getLayoutElements');

const createSubscriberWrapper = (id: string, isScreenshare = false, isPinned = false) => {
  return {
    id,
    subscriber: {
      videoWidth() {
        return 1280;
      },
      videoHeight() {
        return 720;
      },
    },
    isScreenshare,
    isPinned,
  } as unknown as SubscriberWrapper;
};

const createPublisher = () => {
  return {
    videoWidth() {
      return 1280;
    },
    videoHeight() {
      return 720;
    },
  } as unknown as Publisher;
};

// Arguments for initial call with uninitialized ref and no pubs or subs
const initialArguments: GetLayoutBoxesProps = {
  activeSpeakerId: undefined,
  hiddenSubscribers: [],
  isSharingScreen: false,
  hasPinnedSubscribers: false,
  layoutMode: 'active-speaker',
  publisher: null,
  screensharingPublisher: null,
  sessionHasScreenshare: false,
  subscribersInDisplayOrder: [],
  wrapRef: { current: null } as unknown as MutableRefObject<HTMLElement | null>,
  getLayout: () => [],
  wrapDimensions: {
    height: 0,
    width: 0,
  },
};

// Arguments for a call with publisher, screenshare, subscribers and hidden subscribers
const typicalRoomArguments: GetLayoutBoxesProps = {
  publisher: createPublisher(),
  isSharingScreen: true,
  hasPinnedSubscribers: false,
  screensharingPublisher: createPublisher(),
  wrapRef: { current: {} } as unknown as MutableRefObject<HTMLElement | null>,
  subscribersInDisplayOrder: [
    createSubscriberWrapper('sub1'),
    createSubscriberWrapper('sub2'),
    createSubscriberWrapper('sub3'),
  ],
  activeSpeakerId: 'sub2',
  hiddenSubscribers: [createSubscriberWrapper('sub4')],
  layoutMode: 'active-speaker',
  sessionHasScreenshare: false,
  getLayout: () => [],
  wrapDimensions: {
    height: 0,
    width: 0,
  },
};

describe('getLayoutBoxes', () => {
  it('should return empty object if ref.current is not defined', () => {
    const layoutBoxes = getLayoutBoxes(initialArguments);
    expect(layoutBoxes).toEqual({});
  });

  it('should return boxes for all tiles', () => {
    const getLayoutMock = vi.fn().mockImplementation(() => {
      return [
        'publisherBox',
        'subscriber1Box',
        'subscriber2Box',
        'subscriber3Box',
        'localScreenshare',
        'hiddenParticipantTile',
      ];
    });
    const args = {
      ...initialArguments,
      hiddenSubscribers: [createSubscriberWrapper('sub4')],
      publisher: createPublisher(),
      screensharingPublisher: createPublisher(),
      isSharingScreen: true,
      wrapRef: { current: {} } as unknown as MutableRefObject<HTMLElement | null>,
      subscribersInDisplayOrder: [
        createSubscriberWrapper('sub1'),
        createSubscriberWrapper('sub2'),
        createSubscriberWrapper('sub3'),
      ],
      getLayout: getLayoutMock,
    };
    const layoutBoxes = getLayoutBoxes(args);
    expect(layoutBoxes).toEqual({
      publisherBox: 'publisherBox',
      hiddenParticipantsBox: 'hiddenParticipantTile',
      localScreenshareBox: 'localScreenshare',
      subscriberBoxes: ['subscriber1Box', 'subscriber2Box', 'subscriber3Box'],
    });
  });

  it('should return undefined for hiddenParticipantsBox when hiddenTileParticipants array is empty', () => {
    const getLayoutMock = vi.fn().mockImplementation(() => {
      return [
        'publisherBox',
        'subscriber1Box',
        'subscriber2Box',
        'subscriber3Box',
        'localScreenshare',
      ];
    });
    const args = {
      ...typicalRoomArguments,
      hiddenSubscribers: [],
      getLayout: getLayoutMock,
    };
    const layoutBoxes = getLayoutBoxes(args);
    expect(layoutBoxes).toEqual({
      hiddenParticipantsBox: undefined,
      publisherBox: 'publisherBox',
      localScreenshareBox: 'localScreenshare',
      subscriberBoxes: ['subscriber1Box', 'subscriber2Box', 'subscriber3Box'],
    });
  });

  it('should return undefined for localScreenshareBox when screensharingPublisher is null', () => {
    const getLayoutMock = vi.fn().mockImplementation(() => {
      return [
        'publisherBox',
        'subscriber1Box',
        'subscriber2Box',
        'subscriber3Box',
        'hiddenParticipantsBox',
      ];
    });
    const args = {
      ...typicalRoomArguments,
      screensharingPublisher: null,
      isSharingScreen: false,
      getLayout: getLayoutMock,
    };
    const layoutBoxes = getLayoutBoxes(args);
    expect(layoutBoxes).toEqual({
      hiddenParticipantsBox: 'hiddenParticipantsBox',
      publisherBox: 'publisherBox',
      localScreenshareBox: undefined,
      subscriberBoxes: ['subscriber1Box', 'subscriber2Box', 'subscriber3Box'],
    });
  });

  it('should return undefined for localScreenshareBox and hiddenParticipantsBox when not required', () => {
    const getLayoutMock = vi.fn().mockImplementation(() => {
      return ['publisherBox', 'subscriber1Box', 'subscriber2Box', 'subscriber3Box'];
    });
    const args = {
      ...typicalRoomArguments,
      hiddenSubscribers: [],
      screensharingPublisher: null,
      isSharingScreen: false,
      getLayout: getLayoutMock,
    };
    const layoutBoxes = getLayoutBoxes(args);
    expect(layoutBoxes).toEqual({
      hiddenParticipantsBox: undefined,
      localScreenshareBox: undefined,
      publisherBox: 'publisherBox',
      subscriberBoxes: ['subscriber1Box', 'subscriber2Box', 'subscriber3Box'],
    });
  });
});
