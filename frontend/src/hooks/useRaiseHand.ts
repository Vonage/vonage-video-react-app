import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Connection } from '@vonage/client-sdk-video';
import { RaiseHandState, SignalEvent, SignalType, SubscriberWrapper } from '../types/session';

// ---------------------------------------------------------------------------
// Signal payload shapes
// ---------------------------------------------------------------------------

type RaiseHandPayload =
  | { raisedHand: true; timestamp: number }
  | { raisedHand: false; timestamp: null; loweredBy?: string };

export type UseRaiseHandProps = {
  /** Function to send a signal (broadcast or unicast). */
  signal: ((data: SignalType) => void) | undefined;
  /** Returns the connection ID of the local user. */
  getConnectionId: () => string | undefined;
  /** All current subscriber wrappers (used to look up participant names). */
  subscriberWrappers: SubscriberWrapper[];
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
  // Map<connectionId, RaiseHandState> — source of truth for all raised hands
  const [raisedHandsMap, setRaisedHandsMap] = useState<Map<string, RaiseHandState>>(new Map());

  // Ref so signal callbacks (closures) always see the latest map without a
  // stale closure, and so the auto-lower timer always has the current state.
  const raisedHandsMapRef = useRef<Map<string, RaiseHandState>>(raisedHandsMap);

  // Ref to the latest `signal` function so that `onConnectionCreated` (which
  // is registered once with an EventEmitter inside `connect()` and therefore
  // captures the first-render value of `signal`) always calls the up-to-date
  // signal function rather than the stale `undefined` it saw at mount time.
  const signalRef = useRef(signal);

  // Sync both refs in a single effect — one effect per hook guideline.
  useEffect(() => {
    raisedHandsMapRef.current = raisedHandsMap;
    signalRef.current = signal;
  }, [raisedHandsMap, signal]);

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  /** Returns the display name for a given connectionId by looking up subscriber wrappers. */
  const getParticipantName = useCallback(
    (connectionId: string, wrappers: SubscriberWrapper[]): string => {
      const wrapper = wrappers.find(
        (w) => w.subscriber.stream?.connection?.connectionId === connectionId && !w.isScreenshare
      );
      return wrapper?.subscriber.stream?.name ?? '';
    },
    []
  );

  // -------------------------------------------------------------------------
  // State updater
  // -------------------------------------------------------------------------

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
          // Keep the entry but set raisedHand: false so components know it
          // was lowered (e.g. toast showing "your hand was lowered by…")
          next.delete(connectionId);
        }
        return next;
      });
    },
    []
  );

  // -------------------------------------------------------------------------
  // Public actions
  // -------------------------------------------------------------------------

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

    signal({ type: 'raiseHand', data: JSON.stringify(payload) });
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
        type: 'raiseHand',
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

    // Broadcast a lower for each raised hand
    currentMap.forEach((state) => {
      if (state.raisedHand) {
        signal({
          type: 'raiseHand',
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

    // Capture local hand state before clearing
    const localState = localConnectionId
      ? raisedHandsMapRef.current.get(localConnectionId)
      : undefined;

    // Clear all remote hands — they will re-sync via connectionCreated
    if (localState?.raisedHand && localState.raisedHandTimestamp !== null && localConnectionId) {
      // Preserve local hand with original timestamp
      const preserved = new Map<string, RaiseHandState>();
      preserved.set(localConnectionId, localState);
      setRaisedHandsMap(preserved);

      // Re-broadcast to all participants so they restore our queue position
      if (currentSignal) {
        const payload: RaiseHandPayload = {
          raisedHand: true,
          timestamp: localState.raisedHandTimestamp,
        };
        currentSignal({ type: 'raiseHand', data: JSON.stringify(payload) });
      }
    } else {
      setRaisedHandsMap(new Map());
    }
  }, [getConnectionId]);

  // -------------------------------------------------------------------------
  // Inbound signal handler
  // -------------------------------------------------------------------------

  const onRaiseHandSignal = useCallback(
    (event: SignalEvent, currentSubscriberWrappers: SubscriberWrapper[]) => {
      const { data, from: sendingConnection } = event;
      if (!data || !sendingConnection) return;

      const parsed = JSON.parse(data) as RaiseHandPayload & { connectionId?: string };
      const senderConnectionId = sendingConnection.connectionId;
      const localConnectionId = getConnectionId();

      if (parsed.raisedHand) {
        // A participant raised their hand
        const name =
          senderConnectionId === localConnectionId
            ? localUserName
            : getParticipantName(senderConnectionId, currentSubscriberWrappers);
        updateHandState(senderConnectionId, name, {
          raisedHand: true,
          timestamp: parsed.timestamp,
        });
      } else {
        // A hand was lowered — figure out whose
        const targetConnectionId = parsed.connectionId ?? senderConnectionId;
        updateHandState(targetConnectionId, '', { raisedHand: false, timestamp: null });
      }
    },
    [getConnectionId, getParticipantName, localUserName, updateHandState]
  );

  // -------------------------------------------------------------------------
  // Late-joiner sync: unicast current raised state to any new connection
  // -------------------------------------------------------------------------

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
        type: 'raiseHand',
        data: JSON.stringify(payload),
        to: connection,
      });
    },
    [getConnectionId] // signalRef is a stable ref — no need to re-create the callback when signal changes
  );

  // -------------------------------------------------------------------------
  // Connection destroyed → clear that participant's hand
  // -------------------------------------------------------------------------

  const onConnectionDestroyed = useCallback((connectionId: string) => {
    setRaisedHandsMap((prev) => {
      if (!prev.has(connectionId)) return prev;
      const next = new Map(prev);
      next.delete(connectionId);
      return next;
    });
  }, []);

  // -------------------------------------------------------------------------

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
