import { describe, it } from 'vitest';

describe('VonageVideoClient', () => {
  describe('connect to session', () => {
    it('logs on successful connection', () => {});

    it('logs to console on unsuccessful connection', () => {});
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
