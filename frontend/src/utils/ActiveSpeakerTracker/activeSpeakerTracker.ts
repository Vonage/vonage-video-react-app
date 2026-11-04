import { EventEmitter } from 'events';
import throttle from '@common/execution/throttle';

export type SubscriberAudioLevels = Record<string, number>;

export type ActiveSpeakerInfo = {
  subscriberId: string | undefined;
  movingAvg: number;
};

export type ActiveSpeakerChangedPayload = {
  previousActiveSpeaker: ActiveSpeakerInfo;
  newActiveSpeaker: ActiveSpeakerInfo;
};

declare interface ActiveSpeakerTracker {
  emit(event: 'activeSpeakerChanged', payload: ActiveSpeakerChangedPayload): boolean;
  on(event: 'activeSpeakerChanged', listener: (payload: ActiveSpeakerChangedPayload) => void): this;
}

const CALCULATE_ACTIVE_SPEAKER_THROTTLE_TIME = 500;
const SPEECH_LEVEL_RELEASE_TIME_MS = 600;
const ACTIVE_SPEAKER_HOLD_TIME_MS = 500;
const MIN_ACTIVE_SPEAKER_LEVEL = 0.2;
/**
 * ActiveSpeakerTracker class - keeps track of current active speaker and emits event 'activeSpeakerChanged'
 * with active speaker details.
 * Yo must call instance methods onSubscriberAudioLevelUpdated and onSubscriberDestroyed
 * hooking into the audioLevelUpdated and destroyed event from your subscribers.
 * See for reference:
 *  - https://developer.vonage.com/en/video/guides/ui-customization/general-customization#adjusting-user-interface-based-on-audio-levels
 *  - https://vonage.github.io/conversation-docs/video-js-reference/latest/Subscriber.html#event
 * @class ActiveSpeakerTracker
 * @augments {EventEmitter}
 */
class ActiveSpeakerTracker extends EventEmitter {
  _subscriberAudioLevelsBySubscriberId: SubscriberAudioLevels = {};
  _lastAudioLevelUpdateTimeBySubscriberId: Record<string, number> = {};
  _candidate: { subscriberId: string | undefined; since: number } | null = null;
  activeSpeaker: ActiveSpeakerInfo;
  calculateActiveSpeaker: () => void;

  constructor() {
    super();
    this.activeSpeaker = {
      movingAvg: 0,
      subscriberId: undefined,
    };

    this.calculateActiveSpeaker = throttle(
      this._calculateActiveSpeaker,
      CALCULATE_ACTIVE_SPEAKER_THROTTLE_TIME,
      { leading: true, trailing: true }
    );
  }
  onSubscriberDestroyed = (subscriberId: string) => {
    delete this._subscriberAudioLevelsBySubscriberId[subscriberId];
    delete this._lastAudioLevelUpdateTimeBySubscriberId[subscriberId];
    if (this.activeSpeaker.subscriberId === subscriberId) {
      this.activeSpeaker = {
        subscriberId: undefined,
        movingAvg: 0,
      };
    }
    this.calculateActiveSpeaker();
  };

  onSubscriberAudioLevelUpdated = ({
    subscriberId,
    movingAvg,
  }: {
    subscriberId: string;
    movingAvg: number;
  }) => {
    const now = Date.now();
    const previousLevel = this._subscriberAudioLevelsBySubscriberId[subscriberId] ?? 0;
    const previousUpdateTime = this._lastAudioLevelUpdateTimeBySubscriberId[subscriberId] ?? now;
    const releasedPreviousLevel =
      previousLevel * Math.exp(-(now - previousUpdateTime) / SPEECH_LEVEL_RELEASE_TIME_MS);

    this._subscriberAudioLevelsBySubscriberId[subscriberId] = Math.max(
      movingAvg,
      releasedPreviousLevel
    );
    this._lastAudioLevelUpdateTimeBySubscriberId[subscriberId] = now;
    this.calculateActiveSpeaker();
  };

  _calculateActiveSpeaker = () => {
    const subscriberIdAudioLevelKeyValuePair = Object.entries(
      this._subscriberAudioLevelsBySubscriberId
    );
    const activeSpeaker = subscriberIdAudioLevelKeyValuePair.reduce<ActiveSpeakerInfo>(
      (acc, [subscriberId, movingAvg]) => {
        if (movingAvg > acc.movingAvg) {
          return {
            subscriberId,
            movingAvg,
          };
        }
        return acc;
      },
      {
        subscriberId: undefined,
        movingAvg: 0,
      }
    );

    const isNewLoudestSpeaker =
      activeSpeaker.subscriberId !== this.activeSpeaker.subscriberId &&
      activeSpeaker.movingAvg > MIN_ACTIVE_SPEAKER_LEVEL;
    if (!isNewLoudestSpeaker) {
      this._candidate = null;
      return;
    }

    const now = Date.now();
    const isSameCandidate =
      this._candidate !== null && this._candidate.subscriberId === activeSpeaker.subscriberId;
    const candidate =
      isSameCandidate && this._candidate
        ? this._candidate
        : { subscriberId: activeSpeaker.subscriberId, since: now };
    this._candidate = candidate;

    const hasCurrentSpeaker = this.activeSpeaker.subscriberId !== undefined;
    const hasHeldLoudest = now - candidate.since >= ACTIVE_SPEAKER_HOLD_TIME_MS;
    if (hasCurrentSpeaker && !hasHeldLoudest) return;

    this._candidate = null;
    const previousActiveSpeaker = { ...this.activeSpeaker };
    this.activeSpeaker = activeSpeaker;
    this.emit('activeSpeakerChanged', {
      newActiveSpeaker: activeSpeaker,
      previousActiveSpeaker,
    });
  };
}

export default ActiveSpeakerTracker;
