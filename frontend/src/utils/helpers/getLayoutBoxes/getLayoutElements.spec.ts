import { Dimensions, Publisher } from '@vonage/client-sdk-video';
import { beforeEach, describe, expect, it } from 'vitest';
import getLayoutElementArray from './getLayoutElements';
import { LayoutMode } from '../../../Context/SessionProvider/session';
import { SubscriberWrapper } from '../../../types/session';

// Define unique values for width and height so we can identify layout elements
const publisherWidth = 101;
const publisherHeight = 102;
const screenPublisherWidth = 103;
const screenPublisherHeight = 104;
const subscriber1Width = 105;
const subscriber1Height = 106;
const subscriber2Width = 107;
const subscriber2Height = 108;
const subscriber3Width = 109;
const subscriber3Height = 110;
const subscriber4Width = 111;
const subscriber4Height = 112;

const publisherElement = {
  width: publisherWidth,
  height: publisherHeight,
  big: false,
  fixedRatio: false,
};
const cameraPublisher = {
  videoWidth() {
    return publisherWidth;
  },
  videoHeight() {
    return publisherHeight;
  },
} as unknown as Publisher;

const screenPublisherElement = {
  width: screenPublisherWidth,
  height: screenPublisherHeight,
  big: true,
  fixedRatio: true,
};

const screenPublisher = {
  videoWidth() {
    return screenPublisherWidth;
  },
  videoHeight() {
    return screenPublisherHeight;
  },
} as unknown as Publisher;

const createSubscriberWrapper = (id: string, dimensions: Dimensions, isScreenshare = false) => {
  return {
    id,
    subscriber: {
      videoWidth() {
        return dimensions.width;
      },
      videoHeight() {
        return dimensions.height;
      },
    },
    isScreenshare,
  } as unknown as SubscriberWrapper;
};

const subscriber1 = createSubscriberWrapper('sub1', {
  width: subscriber1Width,
  height: subscriber1Height,
});

const subscriber2 = createSubscriberWrapper('sub2', {
  width: subscriber2Width,
  height: subscriber2Height,
});
const subscriber3 = createSubscriberWrapper('sub3', {
  width: subscriber3Width,
  height: subscriber3Height,
});
const subscriber4 = createSubscriberWrapper('sub4', {
  width: subscriber4Width,
  height: subscriber4Height,
});
const subscriber1Element = {
  width: subscriber1Width,
  height: subscriber1Height,
  big: false,
  fixedRatio: false,
};
const subscriber2Element = {
  width: subscriber2Width,
  height: subscriber2Height,
  big: false,
  fixedRatio: false,
};
const subscriber3Element = {
  width: subscriber3Width,
  height: subscriber3Height,
  big: false,
  fixedRatio: false,
};

const hiddenParticipantTileLayoutElement = {
  width: 1280,
  height: 720,
  big: false,
  fixedRatio: false,
};

describe('getLayoutElementArray', () => {
  let activeSpeakerId: string;
  let pinnedSubscriberCount: number;
  let hiddenSubscribers: SubscriberWrapper[];
  let isSharingScreen: boolean;
  let layoutMode: LayoutMode;
  let publisher: Publisher;
  let screensharingPublisher: Publisher;
  let sessionHasScreenshare: boolean;
  let subscribersInDisplayOrder: SubscriberWrapper[];
  beforeEach(() => {
    activeSpeakerId = 'sub2';
    pinnedSubscriberCount = 0;
    hiddenSubscribers = [subscriber4];
    isSharingScreen = true;
    layoutMode = 'active-speaker';
    publisher = cameraPublisher;
    screensharingPublisher = screenPublisher;
    sessionHasScreenshare = true;
    subscribersInDisplayOrder = [subscriber1, subscriber2, subscriber3];
  });

  it('returns elements in correct order', () => {
    const layoutElements = getLayoutElementArray({
      activeSpeakerId,
      pinnedSubscriberCount,
      hiddenSubscribers,
      isSharingScreen,
      layoutMode,
      publisher,
      screensharingPublisher,
      sessionHasScreenshare,
      subscribersInDisplayOrder,
    });

    expect(layoutElements).toEqual([
      publisherElement,
      subscriber1Element,
      subscriber2Element,
      subscriber3Element,
      screenPublisherElement,
      hiddenParticipantTileLayoutElement,
    ]);
  });

  it('makes active speaker element big if screenshare is not present', () => {
    const layoutElements = getLayoutElementArray({
      activeSpeakerId: 'sub1',
      pinnedSubscriberCount,
      hiddenSubscribers: [],
      isSharingScreen: false,
      layoutMode,
      publisher,
      screensharingPublisher: null,
      sessionHasScreenshare: false,
      subscribersInDisplayOrder,
    });

    expect(layoutElements).toEqual([
      publisherElement,
      { ...subscriber1Element, big: true }, // subscriber is big
      subscriber2Element,
      subscriber3Element,
    ]);
  });

  it('does not make active speaker element big if layout-mode is grid', () => {
    const layoutElements = getLayoutElementArray({
      activeSpeakerId: 'sub1',
      pinnedSubscriberCount,
      hiddenSubscribers,
      isSharingScreen: false,
      layoutMode: 'grid',
      publisher,
      screensharingPublisher: null,
      sessionHasScreenshare: false,
      subscribersInDisplayOrder,
    });

    expect(layoutElements).toEqual([
      publisherElement,
      { ...subscriber1Element, big: false }, // subscriber is not big
      subscriber2Element,
      subscriber3Element,
      hiddenParticipantTileLayoutElement,
    ]);
  });

  it('makes screenshare big and fixedRatio, and active-speaker is small', () => {
    const layoutElements = getLayoutElementArray({
      activeSpeakerId: 'sub1',
      pinnedSubscriberCount,
      hiddenSubscribers: [],
      isSharingScreen: false,
      layoutMode,
      publisher,
      screensharingPublisher: null,
      sessionHasScreenshare: true,
      subscribersInDisplayOrder: [
        subscriber1,
        {
          ...subscriber2,
          isScreenshare: true, // make subscriber 2 screenshare
        },
        subscriber3,
      ],
    });

    expect(layoutElements).toEqual([
      publisherElement,
      { ...subscriber1Element, big: false }, // active speaker subscriber is not big
      { ...subscriber2Element, big: true, fixedRatio: true }, // screenshare subscriber is big
      subscriber3Element,
    ]);
  });
});
