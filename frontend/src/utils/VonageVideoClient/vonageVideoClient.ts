import {
  initSession,
  OTError,
  Publisher,
  Session,
  Stream,
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
  SubscriberAudioLevelUpdatedEvent,
} from '../../types/session';
import logOnConnect from '../logOnConnect';
import createMovingAvgAudioLevelTracker from '../movingAverageAudioLevelTracker';

type VonageVideoClientEvents = {
  archiveStarted: [string];
  archiveStopped: [];
  sessionDisconnected: [];
  sessionReconnected: [];
  sessionReconnecting: [];
  signal: [SignalEvent];
  ['signal:chat']: [SignalEvent];
  ['signal:emoji']: [SignalEvent];
  streamPropertyChanged: [];
  subscriberVideoElementCreated: [SubscriberWrapper];
  subscriberDestroyed: [string];
  subscriberAudioLevelUpdated: [SubscriberAudioLevelUpdatedEvent];
};

class VonageVideoClient extends EventEmitter<VonageVideoClientEvents> {
  private readonly clientSession: Session;
  private readonly credential: Credential;

  constructor(credential: Credential) {
    super();
    this.credential = credential;
    const { apiKey, sessionId } = this.credential;
    this.clientSession = initSession(apiKey, sessionId);
    this.init();
  }

  private init() {
    // Attach all event listeners.
    this.clientSession.on('archiveStarted', (event) => this.handleArchiveStarted(event));
    this.clientSession.on('archiveStopped', () => this.handleArchiveStopped());
    this.clientSession.on('sessionDisconnected', () => this.handleSessionDisconnected());
    this.clientSession.on('sessionReconnected', () => this.handleReconnected());
    this.clientSession.on('sessionReconnecting', () => this.handleReconnecting());
    this.clientSession.on('signal', (event) => this.handleSignal(event));
    this.clientSession.on('streamPropertyChanged', () => this.handleStreamPropertyChanged());
    this.clientSession.on('streamCreated', (event) => this.handleStreamCreated(event));
  }

  /**
   * Subscribes to a stream in a session, managing the receiving audio and video from the remote party.
   * We are disabling the default SDK UI to have more control on the display of the subscriber
   * Ref for Vonage Unified https://vonage.github.io/conversation-docs/video-js-reference/latest/Session.html#subscribe
   * Ref for Opentok https://tokbox.com/developer/sdks/js/reference/Session.html#subscribe
   * @param {StreamCreatedEvent} event - The stream emitted when a stream is created
   */
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

    const subscriber = this.session.subscribe(stream, undefined, subscriberOptions);

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
      this.emit('subscriberDestroyed', streamId);
    });

    // Create moving average tracker and add handler for subscriber audioLevelUpdated event emitted periodically with subscriber audio volume
    // See for reference: https://developer.vonage.com/en/video/guides/ui-customization/general-customization#adjusting-user-interface-based-on-audio-levels
    const getMovingAverageAudioLevel = createMovingAvgAudioLevelTracker();
    subscriber.on('audioLevelUpdated', ({ audioLevel }) => {
      const { logMovingAvg } = getMovingAverageAudioLevel(audioLevel);
      this.emit('subscriberAudioLevelUpdated', { movingAvg: logMovingAvg, subscriberId: streamId });
    });
  }

  private handleStreamPropertyChanged() {
    this.emit('streamPropertyChanged');
  }

  private handleSignal(event: SignalEvent) {
    const { type } = event;
    if (type === 'signal:chat' || type === 'signal:emoji') {
      this.emit(type, event);
    }
  }

  private handleReconnecting() {
    this.emit('sessionReconnecting');
  }

  private handleReconnected() {
    this.emit('sessionReconnected');
  }

  private handleSessionDisconnected() {
    this.emit('sessionDisconnected');
  }

  private handleArchiveStarted({ id }: { id: string }) {
    this.emit('archiveStarted', id);
  }

  private handleArchiveStopped() {
    this.emit('archiveStopped');
  }

  async connect(credential: Credential) {
    const { apiKey, sessionId, token } = credential;

    await new Promise((resolve, reject) => {
      this.clientSession.connect(token, (err?: OTError) => {
        if (err) {
          // We ignore the following lint warning because we are rejecting with an OTError object.
          reject(err); // NOSONAR
        } else {
          logOnConnect(apiKey, sessionId, this.clientSession.connection?.connectionId);
          resolve(this.clientSession.sessionId);
        }
      });
    });
  }

  disconnect() {
    this.clientSession.disconnect();
  }

  forceMuteStream(stream: Stream) {
    this.clientSession.forceMuteStream(stream);
  }

  publish(publisher: Publisher) {
    this.clientSession.publish(publisher, (error) => {
      if (error) {
        throw new Error(`${error.name}: ${error.message}`);
      }
    });
  }

  signal(data: SignalType) {
    this.clientSession.signal(data);
  }

  unpublish(publisher: Publisher) {
    this.clientSession.unpublish(publisher);
  }

  get session() {
    return this.clientSession;
  }

  get sessionId() {
    return this.clientSession.sessionId;
  }

  get connectionId() {
    return this.clientSession.connection?.connectionId;
  }
}

export default VonageVideoClient;
