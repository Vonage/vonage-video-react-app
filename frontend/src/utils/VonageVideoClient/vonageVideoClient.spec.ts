import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { initSession, Session, Stream, Subscriber } from '@vonage/client-sdk-video';
import EventEmitter from 'events';
import logOnConnect from '../logOnConnect';
import VonageVideoClient from './vonageVideoClient';
import { Credential } from '../../types/session';

vi.mock('../logOnConnect');
vi.mock('@vonage/client-sdk-video');

type TestSubscriber = Subscriber & EventEmitter;
const mockSubscriber = Object.assign(new EventEmitter(), {
  id: 'test-id',
}) as unknown as TestSubscriber;

const mockLogOnConnect = logOnConnect as Mock<[], void>;
const consoleErrorSpy = vi.spyOn(console, 'error');
const mockInitSession = vi.fn();
const mockConnect = vi.fn();
const mockSubscribe = vi.fn();
const mockDisconnect = vi.fn();
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
    mockSession = Object.assign(new EventEmitter(), {
      connect: mockConnect,
      subscribe: mockSubscribe,
      disconnect: mockDisconnect,
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

      expect(mockLogOnConnect).toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(vonageVideoClient).not.toBeUndefined();
    });

    it('logs to console on unsuccessful connection', async () => {
      const fakeError = 'fake-error';
      mockConnect.mockImplementation((_, callback) => {
        callback(fakeError);
      });
      await expect(() => vonageVideoClient?.connect()).rejects.toThrowError(fakeError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error connecting to session:', fakeError);
      expect(mockLogOnConnect).not.toHaveBeenCalled();
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
          mockSubscriber.emit('videoElementCreated', {
            element: document.createElement('video'),
          });
        });
      }));

    it('emits an event containing the streamId when the stream is destroyed', async () => {
      const streamId = 'stream-id';
      await vonageVideoClient?.connect();

      mockSession.emit('streamCreated', {
        stream: { streamId, videoType: 'screen' } as unknown as Stream,
      });
      mockSubscriber.emit('videoElementCreated', {
        element: document.createElement('video'),
      });

      const subscriberDestroyedPromise = new Promise((resolve) => {
        vonageVideoClient?.on('subscriberDestroyed', (destroyedStreamId) => {
          expect(destroyedStreamId).toBe(streamId);
          resolve(true);
        });
      });

      mockSubscriber.emit('destroyed');

      await subscriberDestroyedPromise;
    });

    it('emits an event when its audio level is updated', () => {
      expect(true).toBe(false);
    });
  });

  it('disconnect should disconnect from the session and cleanup', () => {
    expect(true).toBe(false);
  });

  it('forceMuteStream should call forceMuteStream on the session', () => {
    expect(true).toBe(false);
  });

  describe('publish', () => {
    it('should publish a stream to the session', () => {
      expect(true).toBe(false);
    });

    it('should throw an error if publishing fails', () => {
      expect(true).toBe(false);
    });
  });

  it('unpublish should unpublish a stream from the session', () => {
    expect(true).toBe(false);
  });

  describe('event handling', () => {
    it('should emit archiveStarted when an archive starts', () => {
      expect(true).toBe(false);
    });

    it('should emit archiveStopped when an archive stops', () => {
      expect(true).toBe(false);
    });

    it('should emit sessionDisconnected when the session disconnects', () => {
      expect(true).toBe(false);
    });

    it('should emit sessionReconnected when the session reconnects', () => {
      expect(true).toBe(false);
    });

    it('should emit sessionReconnecting when the session is reconnecting', () => {
      expect(true).toBe(false);
    });

    it('should emit signal:chat when a chat message is received', () => {
      expect(true).toBe(false);
    });

    it('should emit signal:emoji when an emoji is received', () => {
      expect(true).toBe(false);
    });
  });
});
