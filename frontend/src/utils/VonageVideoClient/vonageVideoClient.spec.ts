import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import {
  Connection,
  initSession,
  Publisher,
  Session,
  Stream,
  Subscriber,
} from '@vonage/client-sdk-video';
import EventEmitter from 'events';
import VonageVideoClient from './vonageVideoClient';
import { Credential, SignalEvent, SignalType } from '../../types/session';
import wait from '@common/execution/wait';
import frontendLogger from '../../logger';

vi.mock('@vonage/client-sdk-video');
vi.mock('@common/helpers', () => ({
  decodeSessionKey: () => ({
    sessionId: 'session-id',
    applicationId: 'api-key',
    sessionKey: 'fake.session.key',
  }),
}));
const mockProvider = { log: vi.fn(), reportError: vi.fn() };

frontendLogger.setup(() => mockProvider);

type TestSubscriber = Subscriber & EventEmitter;
const mockSubscriber = Object.assign(new EventEmitter(), {
  id: 'test-id',
}) as unknown as TestSubscriber;

const mockInitSession = vi.fn();
const mockConnectPromise = vi.fn();
const mockConnect = Object.assign(vi.fn(), { promise: mockConnectPromise });
const mockSubscribe = vi.fn();
const mockUnsubscribe = vi.fn();
const mockDisconnect = vi.fn();
const mockPublish = vi.fn();
type TestSession = Session & EventEmitter;

const fakeCredentials: Credential = {
  sessionKey: 'fake.session.key',
  token: 'toe-ken',
};

const fakeSessionId = 'session-id';
const fakeApplicationId = 'api-key';

describe('VonageVideoClient', () => {
  let vonageVideoClient: VonageVideoClient | null;
  let mockSession: TestSession;

  beforeEach(() => {
    vi.spyOn(console, 'error');

    mockSession = Object.assign(new EventEmitter(), {
      connect: mockConnect,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      disconnect: mockDisconnect,
      forceMuteStream: vi.fn(),
      publish: mockPublish,
      unpublish: vi.fn(),
      sessionId: fakeSessionId,
      connection: {
        connectionId: 'connection-id',
      },
      signal: vi.fn(),
    }) as unknown as TestSession;
    mockInitSession.mockReturnValue(mockSession);
    (initSession as Mock).mockImplementation(mockInitSession);
    mockConnectPromise.mockResolvedValue(mockSession);
    mockDisconnect.mockResolvedValue(undefined);
    mockSubscribe.mockReturnValue(mockSubscriber);

    vonageVideoClient = new VonageVideoClient(fakeCredentials);
  });

  afterEach(async () => {
    await vonageVideoClient?.disconnect();
    vonageVideoClient = null;
    vi.resetAllMocks();
  });

  it('constructor should initialize a session with the provided credentials', () => {
    expect(mockInitSession).toHaveBeenCalled();
    expect(vonageVideoClient).not.toBeUndefined();
  });

  describe('connect to session', () => {
    it('logs on successful connection', async () => {
      await vonageVideoClient?.connect();
      await wait(0);

      expect(mockProvider.log).toHaveBeenCalledWith(
        'EnterMeeting',
        expect.objectContaining({
          eventSource: 'vonageVideoClient.connect.success',
          sessionId: fakeSessionId,
          connectionId: 'connection-id',
          partnerId: fakeApplicationId,
        })
      );
      expect(console.error).not.toHaveBeenCalled();
      expect(vonageVideoClient).not.toBeUndefined();
    });

    it('reports the error and rejects on unsuccessful connection', async () => {
      const fakeError = new Error('fake-error');
      mockConnectPromise.mockRejectedValue(fakeError);

      await expect(() => vonageVideoClient?.connect()).rejects.toThrowError(fakeError);

      expect(mockProvider.reportError).toHaveBeenCalledWith(
        expect.objectContaining({ message: fakeError.message, name: fakeError.name }),
        expect.objectContaining({
          eventSource: 'vonageVideoClient.connect.error',
          sessionId: fakeSessionId,
          connectionId: 'connection-id',
          partnerId: fakeApplicationId,
        })
      );
      expect(mockProvider.log).not.toHaveBeenCalledWith('EnterMeeting', expect.anything());
      expect(vonageVideoClient).not.toBeUndefined();
    });
  });

  describe('for subscriber stream created', () => {
    it('emits an event containing a SubscriberWrapper', () =>
      new Promise<void>((done) => {
        const streamId = 'stream-id';
        void vonageVideoClient?.connect().then(() => {
          vonageVideoClient?.on('subscriberVideoElementCreated', (subscriberWrapper) => {
            expect(subscriberWrapper.id).toBe(streamId);
            expect(subscriberWrapper).toHaveProperty('subscriber');
            done();
          });

          mockSession.emit('streamCreated', {
            stream: { streamId } as unknown as Stream,
          });
          mockSubscriber.emit('videoElementCreated', {
            element: document.createElement('video'),
          });
        });
      }));

    it('emits an event for screenshare subscribers', async () => {
      expect.assertions(1);
      const streamId = 'stream-id';

      vonageVideoClient?.on('screenshareStreamCreated', () => {
        expect(true).toBe(true);
      });

      await vonageVideoClient?.connect();

      vi.spyOn(vonageVideoClient!.clientSession, 'subscribe').mockImplementation(
        (_a, _b, _c, callback) => {
          queueMicrotask(() => {
            callback!();
          });

          return mockSubscriber;
        }
      );

      mockSession.emit('streamCreated', {
        stream: { streamId, videoType: 'screen' } as unknown as Stream,
      });

      await wait(10);
    });

    it('emits an event containing the streamId when the stream is destroyed', async () => {
      const streamId = 'stream-id';
      await vonageVideoClient?.connect();

      mockSession.emit('streamCreated', {
        stream: { streamId, videoType: 'screen' } as unknown as Stream,
      });

      const subscriberDestroyedPromise = new Promise((resolve) => {
        vonageVideoClient?.on('subscriberDestroyed', (destroyedStreamId) => {
          expect(destroyedStreamId).toBe(streamId);
          resolve(true);
        });

        mockSubscriber.emit('destroyed');
      });

      await subscriberDestroyedPromise;
    });

    it('emits an event when its audio level is updated', async () => {
      await vonageVideoClient?.connect();
      const streamId = 'stream-id';
      mockSession.emit('streamCreated', {
        stream: { streamId } as unknown as Stream,
      });
      const audioLevelUpdatedPromise = new Promise((resolve) => {
        vonageVideoClient?.on('subscriberAudioLevelUpdated', ({ movingAvg, subscriberId }) => {
          expect(subscriberId).toBe(streamId);
          expect(movingAvg).toBeDefined();
          resolve(true);
        });

        mockSubscriber.emit('audioLevelUpdated', { audioLevel: 0.5 });
      });

      await audioLevelUpdatedPromise;
    });

    it('emits subscriptionError when subscribe returns null and does not attach subscriber listeners', async () => {
      const streamId = 'null-subscriber-stream';

      await vonageVideoClient?.connect();

      const nullSubscriber = new EventEmitter() as unknown as TestSubscriber;
      mockSubscribe.mockReturnValue(undefined);

      const subscriptionErrorPromise = new Promise<unknown>((resolve) => {
        vonageVideoClient?.on('subscriptionError', resolve);
      });

      mockSession.emit('streamCreated', {
        stream: { streamId, videoType: 'camera' } as unknown as Stream,
      });

      const error = await subscriptionErrorPromise;

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Vonage subscriber was not created.');
      // setupSubscriberListeners should never have been called — no subscriber to attach to
      expect(nullSubscriber.listenerCount('videoElementCreated')).toBe(0);
      expect(nullSubscriber.listenerCount('destroyed')).toBe(0);
      expect(nullSubscriber.listenerCount('audioLevelUpdated')).toBe(0);
    });
  });

  it('disconnect should disconnect from the session and cleanup', async () => {
    await vonageVideoClient?.connect();
    await vonageVideoClient?.disconnect();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('disconnect should report (not swallow) a rejection from the session and still clean up', async () => {
    expect.assertions(2);
    const fakeError = new Error('fake-disconnect-error');
    mockDisconnect.mockRejectedValue(fakeError);

    await vonageVideoClient?.connect();
    await vonageVideoClient?.disconnect();

    expect(vonageVideoClient?.clientSession).toBeNull();
    await waitFor(() => {
      if (mockProvider.reportError.mock.calls.length === 0) {
        throw new Error('reportError not called yet');
      }
    });
    expect(mockProvider.reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: fakeError.message, name: fakeError.name }),
      expect.objectContaining({
        eventSource: 'vonageVideoClient.disconnect.error',
        sessionId: fakeSessionId,
      })
    );
  });

  it('disconnect should still disconnect and clean up when unsubscribing the hidden caption subscriber throws', async () => {
    expect.assertions(3);
    const unsubscribeError = new Error('unsubscribe-failed');
    const mockPublisher = {
      id: 'publisher-id',
      stream: { streamId: 'stream-id' },
    } as unknown as Publisher;

    mockPublish.mockImplementation((_publisher, callback) => {
      callback();
    });
    mockSubscribe.mockReturnValue(mockSubscriber);
    mockUnsubscribe.mockImplementation(() => {
      throw unsubscribeError;
    });

    await vonageVideoClient?.connect();
    await vonageVideoClient?.publish(mockPublisher);
    await vonageVideoClient?.disconnect();

    expect(mockDisconnect).toHaveBeenCalled();
    expect(vonageVideoClient?.clientSession).toBeNull();
    await waitFor(() => {
      if (mockProvider.reportError.mock.calls.length === 0) {
        throw new Error('reportError not called yet');
      }
    });
    expect(mockProvider.reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: unsubscribeError.message }),
      expect.objectContaining({
        eventSource: 'vonageVideoClient.disconnect.unsubscribeHiddenSubscriber.error',
      })
    );
  });

  it('forceMuteStream should call forceMuteStream on the session', async () => {
    const mockStream: Stream = {
      streamId: 'stream-id',
    } as unknown as Stream;

    await vonageVideoClient?.connect();
    void vonageVideoClient?.forceMuteStream(mockStream);

    expect(mockSession.forceMuteStream).toHaveBeenCalledWith(mockStream);
  });

  describe('publish', () => {
    const mockPublisher: Publisher = {
      id: 'publisher-id',
    } as unknown as Publisher;

    it('should publish a stream to the session', async () => {
      await vonageVideoClient?.connect();
      void vonageVideoClient?.publish(mockPublisher);
      expect(mockSession.publish).toHaveBeenCalledWith(mockPublisher, expect.any(Function));
      expect(mockSession.publish).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if publishing fails', async () => {
      const error = new Error('Publishing failed');
      error.message = 'Publishing failed';
      error.name = 'oops';
      mockPublish.mockImplementation((_, callback) => {
        callback(error);
      });

      await vonageVideoClient?.connect();

      void expect(() => vonageVideoClient?.publish(mockPublisher)).rejects.toThrow(
        `${error.name}: ${error.message}`
      );
    });
  });

  it('unpublish should unpublish a stream from the session', async () => {
    const mockPublisher: Publisher = {
      id: 'publisher-id',
    } as unknown as Publisher;

    await vonageVideoClient?.connect();
    void vonageVideoClient?.publish(mockPublisher);
    vonageVideoClient?.unpublish(mockPublisher);

    expect(mockSession.unpublish).toHaveBeenCalledWith(mockPublisher);
    expect(mockSession.unpublish).toHaveBeenCalledTimes(1);
  });

  it('signal should send a signal to all participants in the session', async () => {
    const signalData: SignalType = {
      type: 'chat',
      data: 'Hello, world!',
    };

    await vonageVideoClient?.connect();
    vonageVideoClient?.signal(signalData);

    expect(mockSession.signal).toHaveBeenCalledWith(signalData);
    expect(mockSession.signal).toHaveBeenCalledTimes(1);
  });

  describe('event handling', () => {
    it('should emit archiveStarted when an archive starts', async () => {
      const archiveId = 'archive-id';

      const archiveStartedPromise = new Promise((resolve) => {
        vonageVideoClient?.on('archiveStarted', (id) => {
          expect(id).toBe(archiveId);
          resolve(true);
        });

        mockSession.emit('archiveStarted', {
          id: archiveId,
        });
      });
      await archiveStartedPromise;
    });

    it('should emit archiveStopped when an archive stops', async () => {
      const archiveStoppedPromise = new Promise((resolve) => {
        vonageVideoClient?.on('archiveStopped', () => {
          resolve(true);
        });

        mockSession.emit('archiveStopped');
      });

      return archiveStoppedPromise;
    });

    it('should emit sessionDisconnected when the session disconnects', async () => {
      const sessionDisconnectedPromise = new Promise((resolve) => {
        vonageVideoClient?.on('sessionDisconnected', () => {
          resolve(true);
        });

        mockSession.emit('sessionDisconnected');
      });
      return sessionDisconnectedPromise;
    });

    it('should log EnterMeeting to provider (backend handles Kibana via logOnConnect)', async () => {
      await vonageVideoClient?.connect();
      await wait(0);

      expect(mockProvider.log).toHaveBeenCalledWith(
        'EnterMeeting',
        expect.objectContaining({
          eventSource: 'vonageVideoClient.connect.success',
          sessionId: fakeSessionId,
          connectionId: 'connection-id',
          partnerId: fakeApplicationId,
        })
      );
    });

    it('should call frontendLogger.log with reason and partnerId when session disconnects', async () => {
      await vonageVideoClient?.connect();
      await wait(0);

      const logSpy = vi.spyOn(mockProvider, 'log');
      logSpy.mockClear();

      mockSession.emit('sessionDisconnected', { reason: 'forceDisconnected' });

      await wait(0);

      expect(logSpy).toHaveBeenCalledWith(
        'vonageVideoClient: handle session disconnected',
        expect.objectContaining({
          reason: 'forceDisconnected',
          partnerId: 'api-key',
        })
      );

      expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit sessionReconnected when the session reconnects', async () => {
      const sessionReconnectedPromise = new Promise((resolve) => {
        vonageVideoClient?.on('sessionReconnected', () => {
          resolve(true);
        });

        mockSession.emit('sessionReconnected');
      });
      return sessionReconnectedPromise;
    });

    it('should emit sessionReconnecting when the session is reconnecting', async () => {
      const sessionReconnectingPromise = new Promise((resolve) => {
        vonageVideoClient?.on('sessionReconnecting', () => {
          resolve(true);
        });

        mockSession.emit('sessionReconnecting');
      });
      return sessionReconnectingPromise;
    });

    it('should emit signal:chat when a chat message is received', () => {
      const chatSignal: SignalEvent = {
        type: 'signal:chat',
        data: 'Hello, world!',
        from: {
          connectionId: 'connection-id',
          creationTime: 0,
          data: 'connection-data',
        } as unknown as Connection,
      };

      const emitChatSignalPromise = new Promise((resolve) => {
        vonageVideoClient?.on('signal:chat', (event) => {
          expect(event).toEqual(chatSignal);
          resolve(true);
        });

        mockSession.emit('signal', chatSignal);
      });
      return emitChatSignalPromise;
    });

    it('should emit signal:emoji when an emoji is received', () => {
      const emojiSignal: SignalEvent = {
        type: 'signal:emoji',
        data: '👍',
        from: {
          connectionId: 'connection-id',
          creationTime: 0,
          data: 'connection-data',
        } as unknown as Connection,
      };

      const emitEmojiSignalPromise = new Promise((resolve) => {
        vonageVideoClient?.on('signal:emoji', (event) => {
          expect(event).toEqual(emojiSignal);
          resolve(true);
        });

        mockSession.emit('signal', emojiSignal);
      });
      return emitEmojiSignalPromise;
    });

    it('should emit streamPropertyChanged', () => {
      const streamPropertyChangedPromise = new Promise((resolve) => {
        vonageVideoClient?.on('streamPropertyChanged', () => {
          resolve(true);
        });

        mockSession.emit('streamPropertyChanged');
      });
      return streamPropertyChangedPromise;
    });
  });
});
