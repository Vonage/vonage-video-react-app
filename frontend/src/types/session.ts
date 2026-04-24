import { Connection, Event, Session, Stream, Subscriber } from '@vonage/client-sdk-video';

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

/**
 * Represents the credentials required to connect to a session.
 * The sessionKey is a JWT encoding the sessionId, roomName, and other session metadata.
 * The token is an ephemeral token used to authenticate with the Vonage Video API.
 */
export type Credential = {
  sessionKey: string;
  token: string;
};

export type StreamCreatedEvent = Event<'streamCreated', Session> & {
  stream: Stream;
};

export type StreamDestroyedEvent = Event<'streamDestroyed', Session> & {
  stream: Stream;
};

export type VideoElementCreatedEvent = Event<'videoElementCreated', Subscriber> & {
  element: HTMLVideoElement | HTMLObjectElement;
};

export type SignalEvent = {
  type?: string;
  data?: string;
  from: Connection | null;
};

export type SignalType = {
  type: 'emoji' | 'chat' | 'captions';
  data: string;
};

export type SubscriberAudioLevelUpdatedEvent = { movingAvg: number; subscriberId: string };

export type LocalCaptionReceived = { streamId: string; caption: string; isFinal: boolean };

export type StreamPropertyChangedEvent = {
  stream: Stream;
  changedProperty: 'hasAudio' | 'hasVideo' | 'hasCaptions' | 'videoDimensions';
  oldValue: boolean | { width: number; height: number };
  newValue: boolean | { width: number; height: number };
};

export const LAYOUT_MODES = ['grid', 'active-speaker'] as const;

export type LayoutMode = (typeof LAYOUT_MODES)[number];
