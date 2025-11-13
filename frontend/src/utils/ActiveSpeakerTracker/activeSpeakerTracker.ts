import { EventEmitter } from 'events';
import throttle from 'lodash/throttle';

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

const CALCULATE_ACTIVE_SPEAKER_THROTTLE_TIME = 1500;
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
// eslint-disable-next-line no-redeclare
class ActiveSpeakerTracker extends EventEmitter {
  _subscriberAudioLevelsBySubscriberId: SubscriberAudioLevels = {};
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
      {
        // So we don't send events after subscriber is destroyed
        leading: true,
        trailing: false,
      }
    );
  }
  onSubscriberDestroyed = (subscriberId: string) => {
    delete this._subscriberAudioLevelsBySubscriberId[subscriberId];
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
    this._subscriberAudioLevelsBySubscriberId[subscriberId] = movingAvg;
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

    if (
      activeSpeaker.subscriberId !== this.activeSpeaker.subscriberId &&
      activeSpeaker.movingAvg > 0.2
    ) {
      const previousActiveSpeaker = { ...this.activeSpeaker };
      this.activeSpeaker = activeSpeaker;
      this.emit('activeSpeakerChanged', {
        newActiveSpeaker: activeSpeaker,
        previousActiveSpeaker,
      });
    }
  };
}

export default ActiveSpeakerTracker;
