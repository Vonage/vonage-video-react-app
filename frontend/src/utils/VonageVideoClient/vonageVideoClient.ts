import {
  initSession,
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
import isErrorLike from '@common/assertions/isErrorLike';
import frontendLogger from '../../logger';
import { decodeSessionKey } from '@common/helpers';

export type ArchiveStartedEvent = { id: string; name: string };
export type ArchiveStoppedEvent = { id: string; name: string };

type VonageVideoClientEvents = {
  archiveStarted: [ArchiveStartedEvent];
  archiveStopped: [ArchiveStoppedEvent];
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
  public clientSession: Session;
  private readonly credential: Credential;
  public readonly sessionId: string;
  private hiddenSubscriber: Subscriber | null = null;
  private readonly streams = new Map<string, Stream>();
  private readonly subscribersByStreamId = new Map<string, Set<Subscriber>>();
  private disconnected = false;

  /**
   * Creates an instance of VonageVideoClient.
   * Initializes the session and attaches event listeners.
   * @param {Credential} credential - The sessionKey and token required to initialize the session.
   */
  constructor(credential: Credential) {
    super();

    this.credential = credential;

    const { sessionId, applicationId } = decodeSessionKey({ sessionKey: credential.sessionKey });

    this.sessionId = sessionId;

    frontendLogger.setContext({ sessionId, partnerId: applicationId });

    this.clientSession = initSession(applicationId, sessionId, {
      sessionMigration: true,
    });

    this.attachEventListeners();
  }

  /**
   * Attaches event listeners to the Vonage Video session.
   * Handles various session events and emits corresponding custom events.
   * @private
   */
  private attachEventListeners = () => {
    this.clientSession.on('archiveStarted', (event) => this.handleArchiveStarted(event));
    this.clientSession.on('archiveStopped', (event) => this.handleArchiveStopped(event));
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
    if (this.disconnected) {
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
    if (this.disconnected) {
      return;
    }

    const { streamId, videoType, name: remoteParticipantName } = stream;
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
          const subscriber = this.clientSession.subscribe(
            stream,
            undefined,
            subscriberOptions,
            (error) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(subscriber);
            }
          );

          if (!subscriber) {
            reject(new Error('Vonage subscriber was not created.'));
            return;
          }

          this.setupSubscriberListeners({
            subscriber,
            streamId,
            isScreenshare,
            remoteParticipantName,
          });
        });

      frontendLogger.log('vonageVideoClient:SubscribeAttempt', {
        streamId,
        remoteParticipantName,
      });

      await idempotentCallbackWithRetry(() => subscribe(), {
        onRetry: (retryError, attempt) => {
          frontendLogger.log('vonageVideoClient:SubscribeRetry', {
            streamId,
            remoteParticipantName,
            attempt,
            subscriberCount: this.getSubscriberCount(streamId),
            errorName: isErrorLike(retryError) ? retryError.name : undefined,
          });
        },
      });

      frontendLogger.log('vonageVideoClient:Subscribed', {
        streamId,
        remoteParticipantName,
        subscriberCount: this.getSubscriberCount(streamId),
      });

      if (isScreenshare) {
        this.emit('screenshareStreamCreated');
      }
    } catch (syncError) {
      // Check if this is a recoverable error that should not disconnect the user
      const isRecoverableError = this.isRecoverableSubscriptionError(syncError);

      frontendLogger.log('vonageVideoClient:SubscribeFailed', {
        streamId,
        remoteParticipantName,
        isRecoverableError,
        subscriberCount: this.getSubscriberCount(streamId),
        errorName: isErrorLike(syncError) ? syncError.name : undefined,
      });

      if (isRecoverableError) {
        // Don't emit subscriptionError for recoverable errors
        // The stream was likely destroyed before subscription completed (e.g., user refreshed)
        return;
      }

      // Only emit subscriptionError for critical errors
      this.handleSubscriptionError(syncError);
    }
  };

  hasStream = (streamId: string): boolean => {
    return this.streams.has(streamId);
  };

  /**
   * Number of live Subscriber instances currently attached to a stream. Any value above one means
   * the same remote stream is being received more than once, which duplicates its audio.
   * @param {string} streamId - The ID of the stream
   * @returns {number} the amount of subscribers attached to the stream
   */
  getSubscriberCount = (streamId: string): number => {
    return this.subscribersByStreamId.get(streamId)?.size ?? 0;
  };

  getStream = (streamId: string): Stream | undefined => {
    return this.streams.get(streamId);
  };

  getActiveStreams = (): Stream[] => {
    return Array.from(this.streams.values());
  };

  resubscribeToStreamId = async (streamId: string): Promise<void> => {
    if (this.disconnected) {
      return;
    }

    const stream = this.streams.get(streamId);
    if (!stream) {
      return;
    }

    frontendLogger.log('vonageVideoClient:Resubscribe', {
      streamId,
      subscriberCount: this.getSubscriberCount(streamId),
    });

    await this.subscribeToStream(stream);
  };

  /**
   * Sets up event listeners for a subscriber
   * @param {object} params - The parameters object
   * @param {Subscriber} params.subscriber - The subscriber object
   * @param {string} params.streamId - The ID of the stream
   * @param {boolean} params.isScreenshare - Whether the stream is a screenshare
   * @param {string} params.remoteParticipantName - The display name of the participant publishing the stream
   * @private
   */
  private setupSubscriberListeners = ({
    subscriber,
    streamId,
    isScreenshare,
    remoteParticipantName,
  }: {
    subscriber: Subscriber;
    streamId: string;
    isScreenshare: boolean;
    remoteParticipantName: string;
  }) => {
    const subscribersForStream = this.subscribersByStreamId.get(streamId) ?? new Set<Subscriber>();

    subscribersForStream.add(subscriber);
    this.subscribersByStreamId.set(streamId, subscribersForStream);
    subscriber.on('videoElementCreated', (videoElementCreatedEvent: VideoElementCreatedEvent) => {
      const { element } = videoElementCreatedEvent;
      const subscriberWrapper: SubscriberWrapper = {
        id: streamId,
        element,
        isPinned: false,
        isScreenshare,
        subscriber,
      };

      frontendLogger.log('vonageVideoClient:SubscriberVideoElementCreated', {
        streamId,
        remoteParticipantName,
        subscriberCount: subscribersForStream.size,
      });
      this.emit('subscriberVideoElementCreated', subscriberWrapper);
    });

    subscriber.on('destroyed', () => {
      subscribersForStream.delete(subscriber);

      frontendLogger.log('vonageVideoClient:SubscriberDestroyed', {
        streamId,
        remoteParticipantName,
        subscriberCount: subscribersForStream.size,
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
    frontendLogger.log('vonageVideoClient:Reconnecting');

    this.emit('sessionReconnecting');
  };

  /**
   * Emits an event when the session has reconnected.
   * @private
   */
  private handleReconnected = () => {
    frontendLogger.log('vonageVideoClient:Reconnected');

    this.emit('sessionReconnected');
  };

  /**
   * Emits an event when the session is disconnected.
   * @private
   */
  private handleSessionDisconnected = (event: { reason?: string }) => {
    const reason = event?.reason || 'unknown';

    frontendLogger.log('vonageVideoClient:SessionDisconnected', {
      reason,
    });

    this.emit('sessionDisconnected', { reason });
  };

  /**
   * Emits an event when an archive starts.
   * @param {{ id: string; name: string }} param - The archive ID and name.
   * @private
   */
  private handleArchiveStarted = ({ id, name }: { id: string; name: string }) => {
    this.emit('archiveStarted', { id, name });
  };

  /**
   * Emits an event when an archive stops.
   * @param {{ id: string; name: string }} param - The archive ID and name.
   * @private
   */
  private handleArchiveStopped = ({ id, name }: { id: string; name: string }) => {
    this.emit('archiveStopped', { id, name });
  };

  /**
   * Connects to the Vonage Video session using the provided credentials.
   * @returns {Promise<void>} Resolves when the connection is successful, rejects on error.
   */
  connect = async (): Promise<void> => {
    const { token } = this.credential;

    try {
      await this.clientSession.connect.promise(token);

      frontendLogger.setContext({ connectionId: this.connectionId });

      frontendLogger.log('EnterMeeting', {
        eventSource: 'vonageVideoClient.connect.success',
      });
    } catch (error) {
      frontendLogger.reportError(error, {
        eventSource: 'vonageVideoClient.connect.error',
      });

      throw error;
    }
  };

  /**
   * Disconnects from the current session and cleans up the session object.
   */
  disconnect = async (): Promise<void> => {
    if (this.disconnected) {
      return;
    }

    this.disconnected = true;

    try {
      if (this.hiddenSubscriber) {
        this.clientSession.unsubscribe(this.hiddenSubscriber);
        this.hiddenSubscriber = null;
      }
    } catch (error) {
      frontendLogger.reportError(error, {
        eventSource: 'vonageVideoClient.disconnect.unsubscribeHiddenSubscriber.error',
      });
    }

    try {
      await this.clientSession.disconnect();
    } catch (error) {
      frontendLogger.reportError(error, {
        eventSource: 'vonageVideoClient.disconnect.error',
      });
    } finally {
      this.clientSession = null as unknown as Session;
    }
  };

  /**
   * Forces a specific stream to be muted.
   * @param {Stream} stream - The stream to be muted.
   */
  forceMuteStream = async (stream: Stream) => {
    await this.clientSession.forceMuteStream(stream);
  };

  /**
   * Publishes a stream to the session.
   * @param {Publisher} publisher - The publisher object to be published.
   * @throws {Error} Throws an error if publishing fails.
   */
  publish = (publisher: Publisher): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.clientSession.publish(publisher, (error) => {
        if (error) {
          frontendLogger.reportError(error, {
            eventSource: 'vonageVideoClient.publish.error',
            errorCode: (error as { code?: number })?.code,
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
            this.clientSession.subscribe(publisher.stream, document.createElement('div'), {
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
    this.clientSession.signal(data)?.catch(() => {});
  };

  /**
   * Unpublishes a stream from the session.
   * @param {Publisher} publisher - The publisher object to be unpublished.
   */
  unpublish = (publisher: Publisher) => {
    // Clean up the hidden subscriber used for captions
    if (this.hiddenSubscriber) {
      this.clientSession.unsubscribe(this.hiddenSubscriber);
      this.hiddenSubscriber = null;
    }

    this.clientSession.unpublish(publisher);
  };

  /**
   * Gets the connection ID of the current session.
   * @returns {string | undefined} The connection ID.
   */
  get connectionId(): string | undefined {
    return this.clientSession.connection?.connectionId;
  }
}

export default VonageVideoClient;
