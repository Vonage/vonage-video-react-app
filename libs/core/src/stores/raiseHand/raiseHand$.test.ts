import { renderHook } from '@testing-library/react';
import { raiseHand$ } from '@core/stores';

describe('raiseHand$ store', () => {
  beforeEach(() => {
    raiseHand$.actions.lowerAllHands();
  });

  describe('actions', () => {
    it('raises a hand', () => {
      const connectionId = 'conn-1';
      raiseHand$.actions.raiseHand({ connectionId });

      const hands = raiseHand$.getState().raisedHands;
      expect(hands[connectionId]).toBeDefined();
      expect(hands[connectionId].connectionId).toBe(connectionId);
      expect(typeof hands[connectionId].raisedAt).toBe('number');
    });

    it('lowers a hand', () => {
      const connectionId = 'conn-2';
      raiseHand$.actions.raiseHand({ connectionId });
      raiseHand$.actions.lowerHand({ connectionId });

      expect(raiseHand$.getState().raisedHands[connectionId]).toBeUndefined();
    });

    it('lowers all hands', () => {
      raiseHand$.actions.raiseHand({ connectionId: 'conn-3' });
      raiseHand$.actions.raiseHand({ connectionId: 'conn-4' });
      raiseHand$.actions.lowerAllHands();

      expect(raiseHand$.getState().raisedHands).toEqual({});
    });
  });

  describe('queue position', () => {
    it('orders raised hands chronologically and re-numbers after a hand is lowered', () => {
      vi.useFakeTimers();
      vi.setSystemTime(1_000);
      raiseHand$.actions.raiseHand({ connectionId: 'first' });
      vi.setSystemTime(2_000);
      raiseHand$.actions.raiseHand({ connectionId: 'second' });
      vi.setSystemTime(3_000);
      raiseHand$.actions.raiseHand({ connectionId: 'third' });
      vi.useRealTimers();

      const positionOf = (connectionId: string) =>
        renderHook(() => raiseHand$.useRaisedHandPosition(connectionId)).result.current;

      expect(positionOf('first')).toBe(1);
      expect(positionOf('second')).toBe(2);
      expect(positionOf('third')).toBe(3);
      expect(positionOf('not-raised')).toBe(0);

      raiseHand$.actions.lowerHand({ connectionId: 'first' });

      expect(positionOf('second')).toBe(1);
      expect(positionOf('third')).toBe(2);
    });
  });

  describe('state shape', () => {
    it('starts with empty raisedHands', () => {
      expect(raiseHand$.getState().raisedHands).toEqual({});
    });

    it('overwrites existing hand entry on re-raise', () => {
      const connectionId = 'conn-5';
      raiseHand$.actions.raiseHand({ connectionId });
      const firstTimestamp = raiseHand$.getState().raisedHands[connectionId].raisedAt;

      // Re-raise with a small delay to ensure timestamp differs
      raiseHand$.actions.raiseHand({ connectionId });
      const secondTimestamp = raiseHand$.getState().raisedHands[connectionId].raisedAt;

      expect(secondTimestamp).toBeGreaterThanOrEqual(firstTimestamp);
      expect(Object.keys(raiseHand$.getState().raisedHands)).toHaveLength(1);
    });
  });
});
