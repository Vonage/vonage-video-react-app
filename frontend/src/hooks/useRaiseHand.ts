import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Connection } from '@vonage/client-sdk-video';
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
  /** All currently-raised hands, sorted oldest-first (queue order). */
  raisedHands: RaiseHandState[];
  /** Convenience count of raised hands. */
  raisedHandCount: number;
  /** Whether the local user's hand is currently raised. */
  localHandIsRaised: boolean;
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
   * Connection-created handler — call this from the SessionProvider on each
   * `connectionCreated` event so we can unicast the local hand state to
   * late-joiners.
   */
  onConnectionCreated: (connection: Connection) => void;
  /**
   * Connection-destroyed / stream-destroyed handler — call this from the
   * SessionProvider to clear any raised hand for a departing participant.
   */
  onConnectionDestroyed: (connectionId: string) => void;
  /** Reset all raised hands (call on session reconnect). */
  resetAllHands: () => void;
  /** State setter for the raised-hands map (used by useAutoLowerOnDominantSpeaker). */
  setRaisedHandsMap: Dispatch<SetStateAction<Map<string, RaiseHandState>>>;
  /** Ref to the live raised-hands map (used by useAutoLowerOnDominantSpeaker). */
  raisedHandsMapRef: React.RefObject<Map<string, RaiseHandState>>;
};

/**
 * useRaiseHand — core hook for the raise-hand feature.
 *
 * Manages the local and remote raised-hand state, handles signal send / receive,
 * late-joiner sync, auto-lower on dominant speaker, and session-reconnect cleanup.
 *
 * @param {UseRaiseHandProps} props
 * @returns {UseRaiseHand}
 */
const useRaiseHand = ({
  signal,
  getConnectionId,
  localUserName,
}: UseRaiseHandProps): UseRaiseHand => {
  const [raisedHandsMap, setRaisedHandsMap] = useState<Map<string, RaiseHandState>>(new Map());

  // Refs so signal callbacks always see the latest map and signal function;
  // `onConnectionCreated` is registered once on the EventEmitter and would
  // otherwise capture the first-render `signal` (often still undefined).
  const raisedHandsMapRef = useRef<Map<string, RaiseHandState>>(raisedHandsMap);
  const signalRef = useRef(signal);

  useEffect(() => {
    raisedHandsMapRef.current = raisedHandsMap;
    signalRef.current = signal;
  }, [raisedHandsMap, signal]);

  const raisedHands = useMemo<RaiseHandState[]>(() => {
    const raised = [...raisedHandsMap.values()].filter((s) => s.raisedHand);
    raised.sort((a, b) => (a.raisedHandTimestamp ?? 0) - (b.raisedHandTimestamp ?? 0));
    return raised;
  }, [raisedHandsMap]);

  const raisedHandCount = raisedHands.length;

  const localHandIsRaised = useMemo(() => {
    const localConnectionId = getConnectionId();
    if (!localConnectionId) return false;
    return raisedHandsMap.get(localConnectionId)?.raisedHand === true;
  }, [raisedHandsMap, getConnectionId]);

  const getParticipantName = useCallback(
    (connectionId: string, wrappers: SubscriberWrapper[]): string => {
      const wrapper = wrappers.find(
        (w) => w.subscriber.stream?.connection?.connectionId === connectionId && !w.isScreenshare
      );
      return wrapper?.subscriber.stream?.name ?? '';
    },
    []
  );

  const updateHandState = useCallback(
    (connectionId: string, participantName: string, payload: RaiseHandPayload) => {
      setRaisedHandsMap((prev) => {
        const next = new Map(prev);
        if (payload.raisedHand) {
          next.set(connectionId, {
            connectionId,
            participantName,
            raisedHand: true,
            raisedHandTimestamp: payload.timestamp,
          });
        } else {
          next.delete(connectionId);
        }
        return next;
      });
    },
    []
  );

  const raiseHand = useCallback(() => {
    const localConnectionId = getConnectionId();
    if (!localConnectionId || !signal) return;

    const timestamp = Date.now();
    const payload: RaiseHandPayload = { raisedHand: true, timestamp };

    // Optimistic UI — update local state immediately
    setRaisedHandsMap((prev) => {
      const next = new Map(prev);
      next.set(localConnectionId, {
        connectionId: localConnectionId,
        participantName: localUserName,
        raisedHand: true,
        raisedHandTimestamp: timestamp,
      });
      return next;
    });

    signal({ type: RAISE_HAND_SIGNAL, data: JSON.stringify(payload) });
  }, [signal, getConnectionId, localUserName]);

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
      setRaisedHandsMap((prev) => {
        const next = new Map(prev);
        next.delete(targetConnectionId);
        return next;
      });

      signal({
        type: RAISE_HAND_SIGNAL,
        data: JSON.stringify({ ...payload, connectionId: targetConnectionId }),
      });
    },
    [signal, getConnectionId]
  );

  const lowerAllHands = useCallback(() => {
    const localConnectionId = getConnectionId();
    if (!signal) return;

    const currentMap = raisedHandsMapRef.current;
    const payload: RaiseHandPayload = {
      raisedHand: false,
      timestamp: null,
      loweredBy: localConnectionId,
    };

    // Optimistic UI — clear all
    setRaisedHandsMap(new Map());

    currentMap.forEach((state) => {
      if (state.raisedHand) {
        signal({
          type: RAISE_HAND_SIGNAL,
          data: JSON.stringify({ ...payload, connectionId: state.connectionId }),
        });
      }
    });
  }, [signal, getConnectionId]);

  /**
   * Reset all raised hands on session reconnect.
   * If the local user had their hand raised, re-broadcast the original
   * timestamp so their queue position is preserved for other participants.
   */
  const resetAllHands = useCallback(() => {
    const localConnectionId = getConnectionId();
    const currentSignal = signalRef.current;
    const localState = localConnectionId
      ? raisedHandsMapRef.current.get(localConnectionId)
      : undefined;

    // Remote hands re-sync via connectionCreated; the local hand is kept with
    // its original timestamp and re-broadcast so our queue position survives
    // the reconnect.
    if (localState?.raisedHand && localState.raisedHandTimestamp !== null && localConnectionId) {
      const preserved = new Map<string, RaiseHandState>();
      preserved.set(localConnectionId, localState);
      setRaisedHandsMap(preserved);

      if (currentSignal) {
        const payload: RaiseHandPayload = {
          raisedHand: true,
          timestamp: localState.raisedHandTimestamp,
        };
        currentSignal({ type: RAISE_HAND_SIGNAL, data: JSON.stringify(payload) });
      }
    } else {
      setRaisedHandsMap(new Map());
    }
  }, [getConnectionId]);

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
        updateHandState(senderConnectionId, name, {
          raisedHand: true,
          timestamp: parsed.timestamp,
        });
      } else {
        // For moderator lowers the target is the lowered participant, not the sender.
        const targetConnectionId = parsed.connectionId ?? senderConnectionId;
        updateHandState(targetConnectionId, '', { raisedHand: false, timestamp: null });
      }
    },
    [getConnectionId, getParticipantName, localUserName, updateHandState]
  );

  // Unicast our current raised-hand state to a newly-joined connection so
  // late-joiners see the existing queue immediately.
  const onConnectionCreated = useCallback(
    (connection: Connection) => {
      const localConnectionId = getConnectionId();
      const currentSignal = signalRef.current;
      if (!currentSignal || !localConnectionId) return;

      const localState = raisedHandsMapRef.current.get(localConnectionId);
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
    [getConnectionId] // signalRef is a stable ref — no need to re-create the callback when signal changes
  );

  const onConnectionDestroyed = useCallback((connectionId: string) => {
    setRaisedHandsMap((prev) => {
      if (!prev.has(connectionId)) return prev;
      const next = new Map(prev);
      next.delete(connectionId);
      return next;
    });
  }, []);

  return {
    raisedHands,
    raisedHandCount,
    localHandIsRaised,
    raiseHand,
    lowerHand,
    lowerAllHands,
    onRaiseHandSignal,
    onConnectionCreated,
    onConnectionDestroyed,
    resetAllHands,
    setRaisedHandsMap,
    raisedHandsMapRef,
  };
};

export default useRaiseHand;
