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
  StreamDestroyedEvent,
  VideoElementCreatedEvent,
  SubscriberWrapper,
  SignalEvent,
  SignalType,
  SubscriberAudioLevelUpdatedEvent,
  LocalCaptionReceived,
  StreamPropertyChangedEvent,
} from '../../types/session';
import createMovingAvgAudioLevelTracker from '../movingAverageAudioLevelTracker';
import idempotentCallbackWithRetry from '@common/execution/idempotentCallbackWithRetry';
import frontendLogger from '../../logger';

type VonageVideoClientEvents = {
  archiveStarted: [string];
  archiveStopped: [];
  screenshareStreamCreated: [];
  sessionDisconnected: [{ reason?: string }];
  sessionReconnected: [];
  sessionReconnecting: [];
  signal: [SignalEvent];
  'signal:chat': [SignalEvent];
  'signal:emoji': [SignalEvent];
  'signal:captions': [SignalEvent];
  streamPropertyChanged: [StreamPropertyChangedEvent];
  subscriberVideoElementCreated: [SubscriberWrapper];
  subscriberDestroyed: [string];
  subscriberAudioLevelUpdated: [SubscriberAudioLevelUpdatedEvent];
  localCaptionReceived: [LocalCaptionReceived];
  subscriptionError: [unknown];
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
  public clientSession: Session | null;
  private readonly credential: Credential;
  private hiddenSubscriber: Subscriber | null = null;
  private readonly streams = new Map<string, Stream>();

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
    this.clientSession.on('sessionDisconnected', (event) => this.handleSessionDisconnected(event));
    this.clientSession.on('sessionReconnected', () => this.handleReconnected());
    this.clientSession.on('sessionReconnecting', () => this.handleReconnecting());
    this.clientSession.on('signal', (event) => this.handleSignal(event));
    this.clientSession.on('streamPropertyChanged', (event) =>
      this.handleStreamPropertyChanged(event)
    );
    this.clientSession.on('streamCreated', (event) => this.handleStreamCreated(event));
    this.clientSession.on('streamDestroyed', (event) => this.handleStreamDestroyed(event));
  };

  /**
   * Subscribes to a stream in a session, managing the receiving audio and video from the remote party.
   * We are disabling the default SDK UI to have more control on the display of the subscriber
   * Ref for Vonage Unified https://vonage.github.io/conversation-docs/video-js-reference/latest/Session.html#subscribe
   * Ref for Opentok https://tokbox.com/developer/sdks/js/reference/Session.html#subscribe
   * @param {StreamCreatedEvent} event - The event emitted when a stream is created
   * @private
   */
  private async handleStreamCreated(event: StreamCreatedEvent) {
    if (this.clientSession === null) {
      return;
    }
    const { stream } = event;
    const { streamId } = stream;

    this.streams.set(streamId, stream);

    await this.subscribeToStream(stream);
  }

  private handleStreamDestroyed(event: StreamDestroyedEvent) {
    const { stream } = event;
    const streamId = String(stream.streamId);
    this.streams.delete(streamId);
  }

  private subscribeToStream = async (stream: Stream) => {
    if (this.clientSession === null) {
      return;
    }

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
    try {
      const subscribe = () =>
        new Promise<Subscriber>((resolve, reject) => {
          const subscriber = this.clientSession?.subscribe(
            stream,
            undefined,
            subscriberOptions,
            (error) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(subscriber!);
            }
          );

          this.setupSubscriberListeners({
            subscriber: subscriber!,
            streamId,
            isScreenshare,
          });
        });

      frontendLogger.log('vonageVideoClient: subscribe attempt to stream', {
        streamId,
        sessionId: this.sessionId,
        connectionId: this.connectionId,
      });

      await idempotentCallbackWithRetry(() => subscribe());

      frontendLogger.log('vonageVideoClient: subscribed to stream', {
        streamId,
        sessionId: this.sessionId,
        connectionId: this.connectionId,
      });

      if (isScreenshare) {
        this.emit('screenshareStreamCreated');
      }
    } catch (syncError) {
      // Check if this is a recoverable error that should not disconnect the user
      const isRecoverableError = this.isRecoverableSubscriptionError(syncError);

      if (isRecoverableError) {
        // Don't emit subscriptionError for recoverable errors
        // The stream was likely destroyed before subscription completed (e.g., user refreshed)
        return;
      }

      // Only emit subscriptionError for critical errors
      console.error('[SUBSCRIBER] Critical subscription error:', syncError);
      this.handleSubscriptionError(syncError);
    }
  };

  hasStream = (streamId: string): boolean => {
    return this.streams.has(streamId);
  };

  getStream = (streamId: string): Stream | undefined => {
    return this.streams.get(streamId);
  };

  getActiveStreams = (): Stream[] => {
    return Array.from(this.streams.values());
  };

  resubscribeToStreamId = async (streamId: string): Promise<void> => {
    if (this.clientSession === null) {
      return;
    }

    const stream = this.streams.get(streamId);
    if (!stream) {
      return;
    }

    await this.subscribeToStream(stream);
  };

  /**
   * Sets up event listeners for a subscriber
   * @param {object} params - The parameters object
   * @param {Subscriber} params.subscriber - The subscriber object
   * @param {string} params.streamId - The ID of the stream
   * @param {boolean} params.isScreenshare - Whether the stream is a screenshare
   * @private
   */
  private setupSubscriberListeners = ({
    subscriber,
    streamId,
    isScreenshare,
  }: {
    subscriber: Subscriber;
    streamId: string;
    isScreenshare: boolean;
  }) => {
    subscriber.on('videoElementCreated', (videoElementCreatedEvent: VideoElementCreatedEvent) => {
      const { element } = videoElementCreatedEvent;
      const subscriberWrapper: SubscriberWrapper = {
        id: streamId,
        element,
        isPinned: false,
        isScreenshare,
        subscriber,
      };

      frontendLogger.log('vonageVideoClient: subscriber video element created', {
        streamId,
        sessionId: this.sessionId,
        connectionId: this.connectionId,
      });
      this.emit('subscriberVideoElementCreated', subscriberWrapper);
    });

    subscriber.on('destroyed', () => {
      frontendLogger.log('vonageVideoClient: subscriber destroyed', {
        streamId,
        sessionId: this.sessionId,
        connectionId: this.connectionId,
      });
      this.emit('subscriberDestroyed', streamId);
    });

    // Create moving average tracker and add handler for subscriber audioLevelUpdated event emitted periodically with subscriber audio volume
    // See for reference: https://developer.vonage.com/en/video/guides/ui-customization/general-customization#adjusting-user-interface-based-on-audio-levels
    const getMovingAverageAudioLevel = createMovingAvgAudioLevelTracker();
    subscriber.on('audioLevelUpdated', ({ audioLevel }) => {
      const { logMovingAvg } = getMovingAverageAudioLevel(audioLevel);
      this.emit('subscriberAudioLevelUpdated', { movingAvg: logMovingAvg, subscriberId: streamId });
    });
  };

  /**
   * Determines if a subscription error is recoverable and should not disconnect the user.
   * @param {unknown} error - The subscription error
   * @returns {boolean} True if the error is recoverable
   * @private
   */
  private isRecoverableSubscriptionError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const otError = error as { name?: string; message?: string; code?: number };

    // Check by error code
    const recoverableErrorCodes = [
      1501, // OT_STREAM_NOT_FOUND
      1600, // OT_STREAM_DESTROYED
    ];
    if (typeof otError.code === 'number' && recoverableErrorCodes.includes(otError.code)) {
      return true;
    }

    // Check by error name
    const recoverableErrorNames = ['OT_STREAM_NOT_FOUND', 'OT_STREAM_DESTROYED'];
    if (otError.name && recoverableErrorNames.includes(otError.name)) {
      return true;
    }

    // Check by error message patterns
    if (otError.message) {
      const recoverableMessagePatterns = [
        'stream not found',
        'Stream was destroyed before it could be subscribed',
        'stream was destroyed',
      ];

      const messageLC = otError.message.toLowerCase();
      const isRecoverable = recoverableMessagePatterns.some((pattern) =>
        messageLC.includes(pattern)
      );

      if (isRecoverable) {
        return true;
      }
    }

    return false;
  };

  /**
   * Handles subscription errors in a generic way
   * @param {unknown} error - The subscription error
   * @private
   */
  private handleSubscriptionError = (error: unknown) => {
    frontendLogger.reportError(error, {
      eventSource: 'vonageVideoClient.handleSubscriptionError',
      sessionId: this.sessionId,
      connectionId: this.connectionId,
      partnerId: this.credential.apiKey,
    });

    this.emit('subscriptionError', error ?? new Error('Unknown subscription error'));
  };

  /**
   * Emits an event when a stream property changes.
   * @param {StreamPropertyChangedEvent} event - The event containing the stream and the changed property.
   * The event includes the stream, the changed property, and the old and new values.
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
    if (type === 'signal:chat' || type === 'signal:emoji' || type === 'signal:captions') {
      this.emit(type, event);
    }
  };

  /**
   * Emits an event when the session is reconnecting.
   * @private
   */
  private handleReconnecting = () => {
    frontendLogger.log('vonageVideoClient: is reconnecting', {
      sessionId: this.sessionId,
      connectionId: this.connectionId,
      partnerId: this.credential.apiKey,
    });

    this.emit('sessionReconnecting');
  };

  /**
   * Emits an event when the session has reconnected.
   * @private
   */
  private handleReconnected = () => {
    frontendLogger.log('vonageVideoClient: reconnected', {
      sessionId: this.sessionId,
      connectionId: this.connectionId,
      partnerId: this.credential.apiKey,
    });

    this.emit('sessionReconnected');
  };

  /**
   * Emits an event when the session is disconnected.
   * @private
   */
  private handleSessionDisconnected = (event: { reason?: string }) => {
    const reason = event?.reason || 'unknown';
    const sessionId = this.sessionId;
    const connectionId = this.connectionId;

    frontendLogger.log('vonageVideoClient: handle session disconnected', {
      reason,
      sessionId,
      connectionId,
      partnerId: this.credential.apiKey,
    });

    this.emit('sessionDisconnected', { reason });
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
  connect = (): Promise<void> => {
    const { apiKey, sessionId, token } = this.credential;

    return new Promise((resolve, reject) => {
      if (!this.clientSession) {
        reject(new Error('Session has not been initialized.'));
      }
      this.clientSession?.connect(token, (err?: OTError) => {
        if (err) {
          frontendLogger.reportError(err, {
            eventSource: 'vonageVideoClient.connect.error',
            sessionId,
            connectionId: this.connectionId,
            partnerId: apiKey,
          });

          reject(err);
        } else {
          frontendLogger.log('EnterMeeting', {
            eventSource: 'vonageVideoClient.connect.success',
            sessionId,
            connectionId: this.connectionId,
            partnerId: apiKey,
          });

          resolve();
        }
      });
    });
  };

  /**
   * Disconnects from the current session and cleans up the session object.
   */
  disconnect = () => {
    // Clean up the hidden subscriber used for captions
    if (this.hiddenSubscriber) {
      this.clientSession?.unsubscribe(this.hiddenSubscriber);
      this.hiddenSubscriber = null;
    }

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
      if (!this.clientSession) {
        reject(new Error('Session is not initialized.'));
        return;
      }

      this.clientSession?.publish(publisher, (error) => {
        if (error) {
          frontendLogger.reportError(error, {
            eventSource: 'vonageVideoClient.publish.error',
            sessionId: this.sessionId,
            connectionId: this.connectionId,
            errorCode: (error as { code?: number })?.code,
            partnerId: this.credential.apiKey,
          });
          const errorName = error.name || 'OTError';
          const errorMessage = error.message || 'Unknown publish error';
          reject(new Error(`${errorName}: ${errorMessage}`));
          return;
        }

        // the following is needed for the local subscriber to be able to receive captions
        // More information: https://developer.vonage.com/en/video/guides/live-caption#receiving-your-own-live-captions
        if (publisher.stream) {
          this.hiddenSubscriber =
            this.clientSession?.subscribe(publisher.stream, document.createElement('div'), {
              audioVolume: 0,
            }) ?? null;

          this.hiddenSubscriber?.on('captionReceived', (captionEvent) => {
            this.emit('localCaptionReceived', captionEvent);
          });
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
    // Clean up the hidden subscriber used for captions
    if (this.hiddenSubscriber) {
      this.clientSession?.unsubscribe(this.hiddenSubscriber);
      this.hiddenSubscriber = null;
    }

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
