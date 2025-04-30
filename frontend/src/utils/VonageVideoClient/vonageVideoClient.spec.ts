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
const mockSubscribe = vi.fn().mockReturnValue(mockSubscriber);
type TestSession = Session & EventEmitter;

const mockSession = Object.assign(new EventEmitter(), {
  connect: mockConnect,
  subscribe: mockSubscribe,
}) as unknown as TestSession;

const fakeCredentials: Credential = {
  apiKey: 'api-key',
  sessionId: 'session-id',
  token: 'toe-ken',
};

describe('VonageVideoClient', () => {
  beforeEach(() => {
    mockInitSession.mockReturnValue(mockSession);
    (initSession as Mock).mockImplementation(mockInitSession);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('constructor should initialize a session with the provided credentials', () => {
    const vonageVideoClient = new VonageVideoClient(fakeCredentials);

    expect(mockInitSession).toHaveBeenCalled();
    expect(vonageVideoClient).not.toBeUndefined();
  });

  describe('connect to session', () => {
    it('logs on successful connection', async () => {
      mockConnect.mockImplementation((_, callback) => {
        callback();
      });
      const vonageVideoClient = new VonageVideoClient(fakeCredentials);
      await vonageVideoClient.connect();

      expect(mockLogOnConnect).toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(vonageVideoClient).not.toBeUndefined();
    });

    it('logs to console on unsuccessful connection', async () => {
      const fakeError = 'fake-error';
      mockConnect.mockImplementation((_, callback) => {
        callback(fakeError);
      });
      const vonageVideoClient = new VonageVideoClient(fakeCredentials);
      await expect(() => vonageVideoClient.connect()).rejects.toThrowError(fakeError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error connecting to session:', fakeError);
      expect(mockLogOnConnect).not.toHaveBeenCalled();
      expect(vonageVideoClient).not.toBeUndefined();
    });
  });

  describe('for subscribers', () => {
    describe('on stream creation', () => {
      it('emits an event containing a SubscriberWrapper', () =>
        new Promise<void>((done) => {
          const streamId = 'stream-id';
          const vonageVideoClient = new VonageVideoClient(fakeCredentials);

          vonageVideoClient.on('subscriberVideoElementCreated', (subscriberWrapper) => {
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
        }));

      it('emits an event for screenshare subscribers', () =>
        new Promise<void>((done) => {
          const streamId = 'stream-id';
          const vonageVideoClient = new VonageVideoClient(fakeCredentials);

          vonageVideoClient.on('screenshareStreamCreated', () => {
            done();
          });

          mockSession.emit('streamCreated', {
            stream: { streamId, videoType: 'screen' } as unknown as Stream,
          });
          mockSubscriber.emit('videoElementCreated', {
            element: document.createElement('video'),
          });
        }));
    });

    describe('on stream destroyed', () => {
      it('removes the subscriber', () => {});

      it('emits an event containing the streamId', () => {});
    });

    it('emits an event when audio level is updated', () => {});
  });

  it('disconnect should disconnect from the session and cleanup', () => {});

  it('forceMuteStream should call forceMuteStream on the session', () => {});

  describe('publish', () => {
    it('should publish a stream to the session', () => {});

    it('should throw an error if publishing fails', () => {});
  });

  it('unpublish should unpublish a stream from the session', () => {});

  describe('event handling', () => {
    it('should emit archiveStarted when an archive starts', () => {});

    it('should emit archiveStopped when an archive stops', () => {});

    it('should emit sessionDisconnected when the session disconnects', () => {});

    it('should emit sessionReconnected when the session reconnects', () => {});

    it('should emit sessionReconnecting when the session is reconnecting', () => {});

    it('should emit signal:chat when a chat message is received', () => {});

    it('should emit signal:emoji when an emoji is received', () => {});
  });
});
