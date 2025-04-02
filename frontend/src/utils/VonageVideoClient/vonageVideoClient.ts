/* eslint-disable class-methods-use-this */
import {
  initSession,
  OTError,
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
} from '../../types/session';
import logOnConnect from '../logOnConnect';
import createMovingAvgAudioLevelTracker from '../movingAverageAudioLevelTracker';

class VonageVideoClient extends EventEmitter {
  readonly #clientSession: Session;
  readonly #clientSubscribers: Record<string, Subscriber>;

  constructor(credential: Credential) {
    super();
    const { apiKey, sessionId } = credential;
    this.#clientSession = initSession(apiKey, sessionId);
    this.#clientSubscribers = {};
    this.init(credential);
  }

  private init(credential: Credential) {
    // Attach all event listeners
    this.#clientSession.on('streamPropertyChanged', this.handleStreamPropertyChanged);
    this.#clientSession.on('streamCreated', this.handleStreamCreated);

    this.connect(credential);
  }

  private readonly handleStreamPropertyChanged = () => {
    this.emit('streamPropertyChanged');
  };

  private async connect(credential: Credential) {
    const { apiKey, sessionId, token } = credential;
    try {
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
    } catch (error: unknown) {
      console.error(error);
    }
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

  disconnect() {
    this.#clientSession.disconnect();
    Object.keys(this.#clientSubscribers).forEach((key) => delete this.#clientSubscribers[key]);
  }

  forceMuteStream(stream: Stream) {
    this.#clientSession.forceMuteStream(stream);
  }

  get session() {
    return this.#clientSession;
  }

  get subscribers() {
    return this.#clientSubscribers;
  }
}

export default VonageVideoClient;
