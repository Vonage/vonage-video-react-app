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
  StreamPropertyChangedEvent,
} from '../../types/session';
import logOnConnect from '../logOnConnect';
import createMovingAvgAudioLevelTracker from '../movingAverageAudioLevelTracker';

type VonageVideoClientEvents = {
  archiveStarted: [string];
  archiveStopped: [];
  screenshareStreamCreated: [];
  sessionDisconnected: [];
  sessionReconnected: [];
  sessionReconnecting: [];
  signal: [SignalEvent];
  'signal:chat': [SignalEvent];
  'signal:emoji': [SignalEvent];
  streamPropertyChanged: [StreamPropertyChangedEvent];
  subscriberVideoElementCreated: [SubscriberWrapper];
  subscriberDestroyed: [string];
  subscriberAudioLevelUpdated: [SubscriberAudioLevelUpdatedEvent];
};

/**
 * VonageVideoClient class - Manages a Vonage Video session, including subscribing to streams,
 * handling events, and emitting custom events for session-related actions. It serves to
 * provide a structured interface for interacting with the Vonage Video API and to separate
 * React logic from the Vonage Video API logic, allowing for easier testing and maintenance.
 *
 * This class extends `EventEmitter` to provide event-driven functionality.
 * @class VonageVideoClient
 * @augments {EventEmitter}
 */
class VonageVideoClient extends EventEmitter<VonageVideoClientEvents> {
  private clientSession: Session | null;
  private readonly credential: Credential;

  /**
   * Creates an instance of VonageVideoClient.
   * Initializes the session and attaches event listeners.
   * @param {Credential} credential - The API key, session ID, and token required to initialize the session.
   */
  constructor(credential: Credential) {
    super();
    this.credential = credential;
    const { apiKey, sessionId } = this.credential;
    this.clientSession = initSession(apiKey, sessionId);
    this.attachEventListeners();
  }

  /**
   * Attaches event listeners to the Vonage Video session.
   * Handles various session events and emits corresponding custom events.
   * @private
   */
  private attachEventListeners = () => {
    if (!this.clientSession) {
      return;
    }
    this.clientSession.on('archiveStarted', (event) => this.handleArchiveStarted(event));
    this.clientSession.on('archiveStopped', () => this.handleArchiveStopped());
    this.clientSession.on('sessionDisconnected', () => this.handleSessionDisconnected());
    this.clientSession.on('sessionReconnected', () => this.handleReconnected());
    this.clientSession.on('sessionReconnecting', () => this.handleReconnecting());
    this.clientSession.on('signal', (event) => this.handleSignal(event));
    this.clientSession.on('streamPropertyChanged', (event) =>
      this.handleStreamPropertyChanged(event)
    );
    this.clientSession.on('streamCreated', (event) => this.handleStreamCreated(event));
  };

  /**
   * Subscribes to a stream in a session, managing the receiving audio and video from the remote party.
   * We are disabling the default SDK UI to have more control on the display of the subscriber
   * Ref for Vonage Unified https://vonage.github.io/conversation-docs/video-js-reference/latest/Session.html#subscribe
   * Ref for Opentok https://tokbox.com/developer/sdks/js/reference/Session.html#subscribe
   * @param {StreamCreatedEvent} event - The event emitted when a stream is created
   * @private
   */
  private handleStreamCreated = (event: StreamCreatedEvent) => {
    if (this.clientSession === null) {
      return;
    }
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

    const subscriber = this.clientSession.subscribe(stream, undefined, subscriberOptions);

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

    if (isScreenshare) {
      this.emit('screenshareStreamCreated');
    }
  };

  /**
   * Emits an event when a stream property changes.
   * @param event
   * @private
   */
  private handleStreamPropertyChanged = (event: StreamPropertyChangedEvent) => {
    this.emit('streamPropertyChanged', event);
  };

  /**
   * Handles incoming signals and emits specific events based on the signal type.
   * @param {SignalEvent} event - The signal event received from the session.
   * @private
   */
  private handleSignal = (event: SignalEvent) => {
    const { type } = event;
    if (type === 'signal:chat' || type === 'signal:emoji') {
      this.emit(type, event);
    }
  };

  /**
   * Emits an event when the session is reconnecting.
   * @private
   */
  private handleReconnecting = () => {
    this.emit('sessionReconnecting');
  };

  /**
   * Emits an event when the session has reconnected.
   * @private
   */
  private handleReconnected = () => {
    this.emit('sessionReconnected');
  };

  /**
   * Emits an event when the session is disconnected.
   * @private
   */
  private handleSessionDisconnected = () => {
    this.emit('sessionDisconnected');
  };

  /**
   * Emits an event when an archive starts.
   * @param {{ id: string }} param - The archive ID.
   * @private
   */
  private handleArchiveStarted = ({ id }: { id: string }) => {
    this.emit('archiveStarted', id);
  };

  /**
   * Emits an event when an archive stops.
   * @private
   */
  private handleArchiveStopped = () => {
    this.emit('archiveStopped');
  };

  /**
   * Connects to the Vonage Video session using the provided credentials.
   * @returns {Promise<void>} Resolves when the connection is successful, rejects on error.
   */
  connect = async (): Promise<void> => {
    const { apiKey, sessionId, token } = this.credential;

    await new Promise((resolve, reject) => {
      if (!this.clientSession) {
        reject(new Error('Session has not been initialized.'));
      }
      this.clientSession?.connect(token, (err?: OTError) => {
        if (err) {
          console.error('Error connecting to session:', err);
          // We ignore the following lint warning because we are rejecting with an OTError object.
          reject(err); // NOSONAR
        } else {
          logOnConnect(apiKey, sessionId, this.clientSession?.connection?.connectionId);
          resolve(this.clientSession?.sessionId);
        }
      });
    });
  };

  /**
   * Disconnects from the current session and cleans up the session object.
   */
  disconnect = () => {
    this.clientSession?.disconnect();
    this.clientSession = null;
  };

  /**
   * Forces a specific stream to be muted.
   * @param {Stream} stream - The stream to be muted.
   */
  forceMuteStream = async (stream: Stream) => {
    await this.clientSession?.forceMuteStream(stream);
  };

  /**
   * Publishes a stream to the session.
   * @param {Publisher} publisher - The publisher object to be published.
   * @throws {Error} Throws an error if publishing fails.
   */
  publish = (publisher: Publisher): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.clientSession?.publish(publisher, (error) => {
        if (error) {
          reject(new Error(`${error.name}: ${error.message}`));
        }
        resolve();
      });
    });
  };

  /**
   * Sends a signal to all participants in the session.
   * @param {SignalType} data - The signal data to be sent.
   */
  signal = (data: SignalType) => {
    this.clientSession?.signal(data);
  };

  /**
   * Unpublishes a stream from the session.
   * @param {Publisher} publisher - The publisher object to be unpublished.
   */
  unpublish = (publisher: Publisher) => {
    this.clientSession?.unpublish(publisher);
  };

  /**
   * Gets the session ID of the current session.
   * @returns {string | undefined} The session ID.
   */
  get sessionId(): string | undefined {
    return this.clientSession?.sessionId;
  }

  /**
   * Gets the connection ID of the current session.
   * @returns {string | undefined} The connection ID.
   */
  get connectionId(): string | undefined {
    return this.clientSession?.connection?.connectionId;
  }
}

export default VonageVideoClient;
