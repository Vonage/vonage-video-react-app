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

  describe('connect to session', () => {
    it('logs on successful connection', () => {
      const vonageVideoClient = new VonageVideoClient(fakeCredentials);

      expect(mockInitSession).toHaveBeenCalled();
      expect(mockLogOnConnect).toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(vonageVideoClient).not.toBeUndefined();
    });

    it('logs to console on unsuccessful connection', () => {
      const fakeError = 'fake-error';
      mockConnect.mockImplementation((_, callback) => {
        callback(fakeError);
      });
      const vonageVideoClient = new VonageVideoClient(fakeCredentials);

      expect(mockInitSession).toHaveBeenCalled();
      expect(mockLogOnConnect).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(fakeError);
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
});
