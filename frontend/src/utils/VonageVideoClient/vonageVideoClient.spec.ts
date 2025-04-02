import { afterEach, describe, expect, it, Mock, vi } from 'vitest';
import { initSession, Session } from '@vonage/client-sdk-video';
import EventEmitter from 'events';
import logOnConnect from '../logOnConnect';
import VonageVideoClient from './vonageVideoClient';
import { Credential } from '../../types/session';

vi.mock('../logOnConnect');
vi.mock('@vonage/client-sdk-video');

const mockLogOnConnect = logOnConnect as Mock<[], void>;
const consoleErrorSpy = vi.spyOn(console, 'error');
const mockInitSession = initSession as Mock<[], Session>;
const mockConnect = vi.fn();
const mockSession = Object.assign(new EventEmitter(), {
  connect: mockConnect,
}) as unknown as Session;

const fakeCredentials: Credential = {
  apiKey: 'api-key',
  sessionId: 'session-id',
  token: 'toe-ken',
};

describe('VonageVideoClient', () => {
  afterEach(() => {
    mockInitSession.mockReturnValue(mockSession);
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
      it('creates a subscriber', () => {});

      it('emits an event containing a SubscriberWrapper', () => {});
    });

    describe('on stream destroyed', () => {
      it('removes the subscriber', () => {});

      it('emits an event containing the streamId', () => {});
    });

    it('emits an event when audio level is updated', () => {});
  });
});
