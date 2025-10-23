import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import {
  Connection,
  initSession,
  Publisher,
  Session,
  Stream,
  Subscriber,
} from '@vonage/client-sdk-video';
import EventEmitter from 'events';
import logOnConnect from '../logOnConnect';
import VonageVideoClient from './vonageVideoClient';
import { Credential, SignalEvent, SignalType } from '../../types/session';

vi.mock('../logOnConnect');
vi.mock('@vonage/client-sdk-video');

type TestSubscriber = Subscriber & EventEmitter;
const mockSubscriber = Object.assign(new EventEmitter(), {
  id: 'test-id',
}) as unknown as TestSubscriber;

const mockInitSession = vi.fn();
const mockConnect = vi.fn();
const mockSubscribe = vi.fn();
const mockDisconnect = vi.fn();
const mockPublish = vi.fn();
type TestSession = Session & EventEmitter;

const fakeCredentials: Credential = {
  apiKey: 'api-key',
  sessionId: 'session-id',
  token: 'toe-ken',
};

describe('VonageVideoClient', () => {
  let vonageVideoClient: VonageVideoClient | null;
  let mockSession: TestSession;

  beforeEach(() => {
    vi.spyOn(console, 'error');

    mockSession = Object.assign(new EventEmitter(), {
      connect: mockConnect,
      subscribe: mockSubscribe,
      disconnect: mockDisconnect,
      forceMuteStream: vi.fn(),
      publish: mockPublish,
      unpublish: vi.fn(),
      connection: {
        connectionId: 'connection-id',
      },
      signal: vi.fn(),
    }) as unknown as TestSession;
    mockInitSession.mockReturnValue(mockSession);
    (initSession as Mock).mockImplementation(mockInitSession);
    mockConnect.mockImplementation((_, callback) => {
      callback();
    });
    mockSubscribe.mockReturnValue(mockSubscriber);

    vonageVideoClient = new VonageVideoClient(fakeCredentials);
  });

  afterEach(() => {
    vonageVideoClient?.disconnect();
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

      expect(logOnConnect).toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
      expect(vonageVideoClient).not.toBeUndefined();
    });

    it('logs to console on unsuccessful connection', async () => {
      const fakeError = 'fake-error';
      mockConnect.mockImplementation((_, callback) => {
        callback(fakeError);
      });
      await expect(() => vonageVideoClient?.connect()).rejects.toThrowError(fakeError);

      expect(logOnConnect).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error connecting to session:', fakeError);
      expect(vonageVideoClient).not.toBeUndefined();
    });
  });

  describe('for subscriber stream created', () => {
    it('emits an event containing a SubscriberWrapper', () =>
      new Promise<void>((done) => {
        const streamId = 'stream-id';
        vonageVideoClient?.connect().then(() => {
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

    it('emits an event for screenshare subscribers', () =>
      new Promise<void>((done) => {
        const streamId = 'stream-id';
        vonageVideoClient?.connect().then(() => {
          vonageVideoClient?.on('screenshareStreamCreated', () => {
            done();
          });

          mockSession.emit('streamCreated', {
            stream: { streamId, videoType: 'screen' } as unknown as Stream,
          });
        });
      }));

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
  });

  it('disconnect should disconnect from the session and cleanup', async () => {
    await vonageVideoClient?.connect();
    vonageVideoClient?.disconnect();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('forceMuteStream should call forceMuteStream on the session', async () => {
    const mockStream: Stream = {
      streamId: 'stream-id',
    } as unknown as Stream;

    await vonageVideoClient?.connect();
    vonageVideoClient?.forceMuteStream(mockStream);

    expect(mockSession.forceMuteStream).toHaveBeenCalledWith(mockStream);
  });

  describe('publish', () => {
    const mockPublisher: Publisher = {
      id: 'publisher-id',
    } as unknown as Publisher;

    it('should publish a stream to the session', async () => {
      await vonageVideoClient?.connect();
      vonageVideoClient?.publish(mockPublisher);
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

      expect(() => vonageVideoClient?.publish(mockPublisher)).rejects.toThrow(
        `${error.name}: ${error.message}`
      );
    });
  });

  it('unpublish should unpublish a stream from the session', async () => {
    const mockPublisher: Publisher = {
      id: 'publisher-id',
    } as unknown as Publisher;

    await vonageVideoClient?.connect();
    vonageVideoClient?.publish(mockPublisher);
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
