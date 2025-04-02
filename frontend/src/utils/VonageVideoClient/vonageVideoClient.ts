/* eslint-disable class-methods-use-this */
import {
  initSession,
  OTError,
  Publisher,
  Session,
  Stream,
  Subscriber,
  SubscriberProperties,
} from '@vonage/client-sdk-video';
import { EventEmitter } from 'events';
import {
  Credential,
  StreamCreatedEvent,
  VideoElementCreatedEvent,
  SubscriberWrapper,
  SignalEvent,
  SignalType,
} from '../../types/session';
import logOnConnect from '../logOnConnect';
import createMovingAvgAudioLevelTracker from '../movingAverageAudioLevelTracker';

type VonageVideoClientEvents = {
  signal: [SignalEvent];
  streamPropertyChanged: [];
  subscriberVideoElementCreated: [SubscriberWrapper];
  subscriberDestroyed: [{ id: string }];
  subscriberAudioLevelUpdated: [{ movingAvg: number; subscriberId: string }];
};

class VonageVideoClient extends EventEmitter<VonageVideoClientEvents> {
  readonly #clientSession: Session;
  readonly #clientSubscribers: Record<string, Subscriber>;
  private readonly credential: Credential;

  constructor(credential: Credential) {
    super();
    this.credential = credential;
    const { apiKey, sessionId } = this.credential;
    this.#clientSession = initSession(apiKey, sessionId);
    this.#clientSubscribers = {};
    this.init();
  }

  private init() {
    // Attach all event listeners
    this.#clientSession.on('streamPropertyChanged', this.handleStreamPropertyChanged);
    this.#clientSession.on('streamCreated', this.handleStreamCreated);
  }

  private handleStreamCreated(event: StreamCreatedEvent) {
    const { stream } = event;
    const { streamId, videoType } = stream;
    const isScreenshare = videoType === 'screen';

    const subscriberOptions: SubscriberProperties = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
      preferredResolution: 'auto',
      style: {
        buttonDisplayMode: 'off',
        nameDisplayMode: 'on',
      },
      insertDefaultUI: false,
    };

    const subscriber = this.#clientSession.subscribe(stream, undefined, subscriberOptions);
    this.subscribers[streamId] = subscriber;

    subscriber.on('videoElementCreated', (videoElementCreatedEvent: VideoElementCreatedEvent) => {
      const { element } = videoElementCreatedEvent;
      const subscriberWrapper: SubscriberWrapper = {
        // subscriber.id is refers to the targetElement id and will be undefined when insertDefaultUI is false so we use streamId to track our subscriber
        id: streamId,
        element,
        isPinned: false,
        isScreenshare,
        subscriber,
      };

      this.emit('subscriberVideoElementCreated', subscriberWrapper);
    });
    subscriber.on('destroyed', () => {
      delete this.subscribers[streamId];
      this.emit('subscriberDestroyed', { id: streamId });
    });

    // Create moving average tracker and add handler for subscriber audioLevelUpdated event emitted periodically with subscriber audio volume
    // See for reference: https://developer.vonage.com/en/video/guides/ui-customization/general-customization#adjusting-user-interface-based-on-audio-levels
    const getMovingAverageAudioLevel = createMovingAvgAudioLevelTracker();
    subscriber.on('audioLevelUpdated', ({ audioLevel }) => {
      const { logMovingAvg } = getMovingAverageAudioLevel(audioLevel);
      this.emit('subscriberAudioLevelUpdated', { movingAvg: logMovingAvg, subscriberId: streamId });
    });
  }

  private readonly handleStreamPropertyChanged = () => {
    this.emit('streamPropertyChanged');
  };

  async connect(credential: Credential) {
    const { apiKey, sessionId, token } = credential;

    await new Promise((resolve, reject) => {
      this.#clientSession.connect(token, (err?: OTError) => {
        if (err) {
          // We ignore the following lint warning because we are rejecting with an OTError object.
          reject(err); // NOSONAR
        } else {
          logOnConnect(apiKey, sessionId, this.#clientSession.connection?.connectionId);
          resolve(this.#clientSession.sessionId);
        }
      });
    });
  }

  disconnect() {
    this.#clientSession.disconnect();
    Object.keys(this.#clientSubscribers).forEach((key) => delete this.#clientSubscribers[key]);
  }

  forceMuteStream(stream: Stream) {
    this.#clientSession.forceMuteStream(stream);
  }

  publish(publisher: Publisher) {
    this.#clientSession.publish(publisher, (error) => {
      if (error) {
        throw new Error(`${error.name}: ${error.message}`);
      }
    });
  }

  signal(data: SignalType) {
    this.#clientSession.signal(data);
  }

  unpublish(publisher: Publisher) {
    this.#clientSession.unpublish(publisher);
  }

  get session() {
    return this.#clientSession;
  }

  get subscribers() {
    return this.#clientSubscribers;
  }

  get sessionId() {
    return this.#clientSession.sessionId;
  }

  get connectionId() {
    return this.#clientSession.connection?.connectionId;
  }
}

export default VonageVideoClient;
