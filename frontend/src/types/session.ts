import { Subscriber } from '@vonage/client-sdk-video';

/**
 * Wrapper for a subscriber, including the DOM element, the subscriber object, whether it's a screenshare subscriber and whether it has been pinned.
 */
export type SubscriberWrapper = {
  element: HTMLVideoElement | HTMLObjectElement;
  subscriber: Subscriber;
  isScreenshare: boolean;
  id: string;
  isPinned: boolean;
};
