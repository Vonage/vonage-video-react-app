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
 * For Opentok the apiKey is the project Id
 * For Vonage Unified the apiKey is the application Id
 */
export type Credential = {
  apiKey: string;
  sessionId: string;
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
  type: 'emoji' | 'chat' | 'captions' | 'raiseHand';
  data: string;
  to?: Connection;
};

/**
 * Raised-hand state for a single participant.
 * Keyed by connectionId in the raise-hand map.
 */
export type RaiseHandState = {
  /** The connection ID of the participant (key into the map). */
  connectionId: string;
  /** Participant's display name, used in UI (toast, queue list, pill). */
  participantName: string;
  /** Whether the hand is currently raised. */
  raisedHand: boolean;
  /** Epoch ms when the hand was raised; null when lowered. */
  raisedHandTimestamp: number | null;
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
