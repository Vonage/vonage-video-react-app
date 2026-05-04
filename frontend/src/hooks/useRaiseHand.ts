import { useCallback, useEffect, useRef } from 'react';
import { Connection } from '@vonage/client-sdk-video';
import raiseHand$ from '../stores/raiseHand/raiseHand$';
import { RaiseHandState, SignalEvent, SignalType, SubscriberWrapper } from '../types/session';

const RAISE_HAND_SIGNAL = 'raiseHand' as const;

type RaiseHandPayload =
  | { raisedHand: true; timestamp: number }
  | { raisedHand: false; timestamp: null; loweredBy?: string };

export type UseRaiseHandProps = {
  /** Function to send a signal (broadcast or unicast). */
  signal: ((data: SignalType) => void) | undefined;
  /** Returns the connection ID of the local user. */
  getConnectionId: () => string | undefined;
  /** Local user's display name (for late-joiner sync payload). */
  localUserName: string;
};

export type UseRaiseHand = {
  /** Raise the local user's hand. */
  raiseHand: () => void;
  /**
   * Lower a hand.
   * - No argument  → lower the local user's own hand.
   * - connectionId → moderator lowers that participant's hand.
   */
  lowerHand: (connectionId?: string) => void;
  /** Lower every raised hand in the session. */
  lowerAllHands: () => void;
  /**
   * Inbound signal handler — call this from the SessionProvider whenever a
   * `signal:raiseHand` event is received.
   */
  onRaiseHandSignal: (event: SignalEvent, currentSubscriberWrappers: SubscriberWrapper[]) => void;
  /**
   * Connection-created handler — sends the local hand state via unicast to a newly-joined
   * connection so late-joiners see the queue.
   */
  onConnectionCreated: (connection: Connection) => void;
  /** Connection-destroyed handler — clears any raised hand for a departing participant. */
  onConnectionDestroyed: (connectionId: string) => void;
  /** Reset all raised hands (call on session reconnect). */
  resetAllHands: () => void;
};

/**
 * Coordinates the raise-hand feature with the global `raiseHand$` store.
 *
 * State (the handsMap) lives in the store so the SessionContext doesn't churn
 * on every raise/lower; this hook only handles the session-side wiring:
 * sending signals, parsing inbound signals, and reacting to connection events.
 */
const useRaiseHand = ({
  signal,
  getConnectionId,
  localUserName,
}: UseRaiseHandProps): UseRaiseHand => {
  // Subscribe to the store at the hook level so we can call its actions /
  // read its state from non-render callbacks. `use.actions()` and `use.api()`
  // internally call `useContext`, so they must be invoked here (React
  // render time), not from inside event handlers.
  const storeActions = raiseHand$.use.actions();
  const storeApi = raiseHand$.use.api();

  // Ref to the latest signal function. `onConnectionCreated` is registered
  // once on the EventEmitter and would otherwise capture the first-render
  // value (often still undefined).
  const signalRef = useRef(signal);
  useEffect(() => {
    signalRef.current = signal;
  }, [signal]);

  const getParticipantName = useCallback(
    (connectionId: string, wrappers: SubscriberWrapper[]): string => {
      const wrapper = wrappers.find(
        (w) => w.subscriber.stream?.connection?.connectionId === connectionId && !w.isScreenshare
      );
      return wrapper?.subscriber.stream?.name ?? '';
    },
    []
  );

  const raiseHand = useCallback(() => {
    const localConnectionId = getConnectionId();
    if (!localConnectionId || !signal) return;

    const timestamp = Date.now();
    const payload: RaiseHandPayload = { raisedHand: true, timestamp };

    // Optimistic UI — update store immediately, then signal.
    storeActions.setHand(localConnectionId, {
      connectionId: localConnectionId,
      participantName: localUserName,
      raisedHand: true,
      raisedHandTimestamp: timestamp,
    });

    signal({ type: RAISE_HAND_SIGNAL, data: JSON.stringify(payload) });
  }, [signal, getConnectionId, localUserName, storeActions]);

  const lowerHand = useCallback(
    (connectionId?: string) => {
      const localConnectionId = getConnectionId();
      const targetConnectionId = connectionId ?? localConnectionId;
      if (!targetConnectionId || !signal) return;

      const isRemoteLower = !!connectionId && connectionId !== localConnectionId;
      const payload: RaiseHandPayload = {
        raisedHand: false,
        timestamp: null,
        ...(isRemoteLower ? { loweredBy: localConnectionId } : {}),
      };

      // Optimistic UI
      storeActions.removeHand(targetConnectionId);

      signal({
        type: RAISE_HAND_SIGNAL,
        data: JSON.stringify({ ...payload, connectionId: targetConnectionId }),
      });
    },
    [signal, getConnectionId, storeActions]
  );

  const lowerAllHands = useCallback(() => {
    const localConnectionId = getConnectionId();
    if (!signal) return;

    const currentMap = storeApi.getState().handsMap;
    const payload: RaiseHandPayload = {
      raisedHand: false,
      timestamp: null,
      loweredBy: localConnectionId,
    };

    // Optimistic UI — clear all
    storeActions.clear();

    currentMap.forEach((state) => {
      if (state.raisedHand) {
        signal({
          type: RAISE_HAND_SIGNAL,
          data: JSON.stringify({ ...payload, connectionId: state.connectionId }),
        });
      }
    });
  }, [signal, getConnectionId, storeActions, storeApi]);

  /**
   * On reconnect, drop remote hands (they re-sync via connectionCreated) but
   * preserve the local hand with its original timestamp and re-broadcast it
   * so our queue position survives the reconnect.
   */
  const resetAllHands = useCallback(() => {
    const localConnectionId = getConnectionId();
    const currentSignal = signalRef.current;
    const localState = localConnectionId
      ? storeApi.getState().handsMap.get(localConnectionId)
      : undefined;

    if (localState?.raisedHand && localState.raisedHandTimestamp !== null && localConnectionId) {
      const preserved = new Map<string, RaiseHandState>();
      preserved.set(localConnectionId, localState);
      storeActions.replaceAll(preserved);

      if (currentSignal) {
        const payload: RaiseHandPayload = {
          raisedHand: true,
          timestamp: localState.raisedHandTimestamp,
        };
        currentSignal({ type: RAISE_HAND_SIGNAL, data: JSON.stringify(payload) });
      }
    } else {
      storeActions.clear();
    }
  }, [getConnectionId, storeActions, storeApi]);

  const onRaiseHandSignal = useCallback(
    (event: SignalEvent, currentSubscriberWrappers: SubscriberWrapper[]) => {
      const { data, from: sendingConnection } = event;
      if (!data || !sendingConnection) return;

      let parsed: RaiseHandPayload & { connectionId?: string };
      try {
        parsed = JSON.parse(data) as RaiseHandPayload & { connectionId?: string };
      } catch (err) {
        console.warn('useRaiseHand: failed to parse raiseHand signal payload', err);
        return;
      }
      const senderConnectionId = sendingConnection.connectionId;
      const localConnectionId = getConnectionId();

      if (parsed.raisedHand) {
        const name =
          senderConnectionId === localConnectionId
            ? localUserName
            : getParticipantName(senderConnectionId, currentSubscriberWrappers);
        storeActions.setHand(senderConnectionId, {
          connectionId: senderConnectionId,
          participantName: name,
          raisedHand: true,
          raisedHandTimestamp: parsed.timestamp,
        });
      } else {
        // For moderator lowers the target is the lowered participant, not the sender.
        const targetConnectionId = parsed.connectionId ?? senderConnectionId;
        storeActions.removeHand(targetConnectionId);
      }
    },
    [getConnectionId, getParticipantName, localUserName, storeActions]
  );

  const onConnectionCreated = useCallback(
    (connection: Connection) => {
      const localConnectionId = getConnectionId();
      const currentSignal = signalRef.current;
      if (!currentSignal || !localConnectionId) return;

      const localState = storeApi.getState().handsMap.get(localConnectionId);
      if (!localState?.raisedHand || localState.raisedHandTimestamp === null) return;

      const payload: RaiseHandPayload = {
        raisedHand: true,
        timestamp: localState.raisedHandTimestamp,
      };
      currentSignal({
        type: RAISE_HAND_SIGNAL,
        data: JSON.stringify(payload),
        to: connection,
      });
    },
    [getConnectionId, storeApi] // signalRef is a stable ref
  );

  const onConnectionDestroyed = useCallback(
    (connectionId: string) => {
      storeActions.removeHand(connectionId);
    },
    [storeActions]
  );

  return {
    raiseHand,
    lowerHand,
    lowerAllHands,
    onRaiseHandSignal,
    onConnectionCreated,
    onConnectionDestroyed,
    resetAllHands,
  };
};

export default useRaiseHand;
