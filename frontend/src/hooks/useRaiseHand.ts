import { useCallback, useEffect, useRef } from 'react';
import type { Connection } from '@vonage/client-sdk-video';
import { raiseHand$, type RaisedHandEntry } from '@core/stores';
import tryCatch from '@common/execution/tryCatch';
import { SignalEvent, SignalType, SubscriberWrapper } from '../types/session';

const RAISE_HAND_SIGNAL = 'raiseHand' as const;

/**
 * Wire format. `lowerAll: true` is a single broadcast that every peer
 * processes locally to clear their own copy of the queue (avoids the
 * N-signals-in-a-tight-loop pattern that risks out-of-order delivery
 * leaving participants with inconsistent state).
 */
type RaiseHandPayload =
  | { raisedHand: true; timestamp: number; participantName?: string }
  | { raisedHand: false; timestamp: null; connectionId?: string; loweredBy?: string }
  | { raisedHand: false; timestamp: null; lowerAll: true; loweredBy?: string };

/** Type guard validating a parsed signal payload from the wire. */
const isValidPayload = (v: unknown): v is RaiseHandPayload => {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  if (o.raisedHand === true) {
    // Reject NaN, Infinity, missing, or non-finite timestamps. These would
    // poison the queue-order comparator (NaN-NaN = NaN; sort becomes
    // implementation-defined for any pair containing it).
    if (typeof o.timestamp !== 'number' || !Number.isFinite(o.timestamp)) return false;
    // participantName is optional (older peers / legacy signals omit it);
    // when present it must be a string.
    return o.participantName === undefined || typeof o.participantName === 'string';
  }
  if (o.raisedHand === false) {
    return o.timestamp === null;
  }
  return false;
};

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
 *
 * All outbound sends use `signalRef.current` rather than the captured
 * `signal` so callbacks stay stable across `signal` identity changes — and
 * so EventEmitter-registered handlers (`onConnectionCreated`) always see
 * the latest function rather than the first-render value (often undefined).
 */
const useRaiseHand = ({
  signal,
  getConnectionId,
  localUserName,
}: UseRaiseHandProps): UseRaiseHand => {
  // Subscribe to the store at hook level — `use.actions()` / `use.api()`
  // call `useContext` and must be invoked at React render time, not from
  // inside event handlers.
  const storeActions = raiseHand$.use.actions();
  const storeApi = raiseHand$.use.api();

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
    const send = signalRef.current;
    const localConnectionId = getConnectionId();
    if (!localConnectionId || !send) return;

    const timestamp = Date.now();
    // Include `participantName` so peers don't have to do a subscriber-wrapper
    // lookup to learn who raised. Critical for late joiners — the unicast
    // rebroadcast in `onConnectionCreated` arrives before the joiner has
    // subscribed to existing streams, so the lookup returns '' and the queue
    // entry shows up without a name.
    const payload: RaiseHandPayload = {
      raisedHand: true,
      timestamp,
      participantName: localUserName,
    };

    // Optimistic UI — update store immediately, then signal.
    storeActions.setHand(localConnectionId, {
      connectionId: localConnectionId,
      participantName: localUserName,
      raisedHand: true,
      raisedHandTimestamp: timestamp,
    });

    send({ type: RAISE_HAND_SIGNAL, data: JSON.stringify(payload) });
  }, [getConnectionId, localUserName, storeActions]);

  const lowerHand = useCallback(
    (connectionId?: string) => {
      const send = signalRef.current;
      const localConnectionId = getConnectionId();
      const targetConnectionId = connectionId ?? localConnectionId;
      if (!targetConnectionId || !send) return;

      const isRemoteLower = !!connectionId && connectionId !== localConnectionId;
      const payload: RaiseHandPayload = {
        raisedHand: false,
        timestamp: null,
        connectionId: targetConnectionId,
        ...(isRemoteLower ? { loweredBy: localConnectionId } : {}),
      };

      // Optimistic UI
      storeActions.removeHand(targetConnectionId);

      send({ type: RAISE_HAND_SIGNAL, data: JSON.stringify(payload) });
    },
    [getConnectionId, storeActions]
  );

  const lowerAllHands = useCallback(() => {
    const send = signalRef.current;
    const localConnectionId = getConnectionId();
    // Guard symmetric with raiseHand(): without a local connection ID we
    // can't attribute `loweredBy`, and an unattributed broadcast would
    // serialize `loweredBy` as missing on the wire — moderator-action
    // attribution gets lost while the action still fires for receivers.
    if (!localConnectionId || !send) return;

    // Single broadcast — every peer (including ourselves) processes it once
    // and clears their own queue. Avoids the N-signals-in-a-tight-loop
    // pattern that risks out-of-order delivery leaving participants with
    // inconsistent state.
    const payload: RaiseHandPayload = {
      raisedHand: false,
      timestamp: null,
      lowerAll: true,
      loweredBy: localConnectionId,
    };

    // Optimistic UI
    storeActions.clear();

    send({ type: RAISE_HAND_SIGNAL, data: JSON.stringify(payload) });
  }, [getConnectionId, storeActions]);

  /**
   * On reconnect, drop remote hands (they re-sync via connectionCreated) but
   * preserve the local hand with its original timestamp and re-broadcast it
   * so our queue position survives the reconnect.
   */
  const resetAllHands = useCallback(() => {
    const send = signalRef.current;
    const localConnectionId = getConnectionId();
    const localState = localConnectionId
      ? storeApi.getState().handsMap.get(localConnectionId)
      : undefined;

    // Store invariant: if `localState` is set, it's a raised entry (the type
    // narrows `raisedHand` to `true` already).
    if (localState && localConnectionId) {
      const preserved = new Map<string, RaisedHandEntry>();
      preserved.set(localConnectionId, localState);
      storeActions.replaceAll(preserved);

      if (send) {
        const payload: RaiseHandPayload = {
          raisedHand: true,
          timestamp: localState.raisedHandTimestamp,
          participantName: localUserName,
        };
        send({ type: RAISE_HAND_SIGNAL, data: JSON.stringify(payload) });
      }
    } else {
      storeActions.clear();
    }
  }, [getConnectionId, localUserName, storeActions, storeApi]);

  const onRaiseHandSignal = useCallback(
    (event: SignalEvent, currentSubscriberWrappers: SubscriberWrapper[]) => {
      const { data, from: sendingConnection } = event;
      if (!data || !sendingConnection) return;

      const { result: parsed, error } = tryCatch(() => JSON.parse(data) as unknown);
      if (error || !isValidPayload(parsed)) {
        console.warn('useRaiseHand: ignoring malformed raiseHand signal', error);
        return;
      }

      const senderConnectionId = sendingConnection.connectionId;
      const localConnectionId = getConnectionId();

      if (parsed.raisedHand) {
        // The SDK echoes our own signal back to us; we already wrote the
        // entry optimistically in `raiseHand()`, so re-applying it would
        // be a needless store write + re-render. Lower signals must still
        // process — they may target a different participant or be a
        // `lowerAll` broadcast.
        if (senderConnectionId === localConnectionId) return;
        // Prefer the name carried on the payload (the sender knows their
        // own display name). The wrapper lookup is a fallback for legacy
        // signals that omit it — and the late-joiner case where the
        // wrapper hasn't subscribed yet would otherwise return '' and the
        // queue entry would render without a name.
        const name =
          parsed.participantName ||
          getParticipantName(senderConnectionId, currentSubscriberWrappers);
        storeActions.setHand(senderConnectionId, {
          connectionId: senderConnectionId,
          participantName: name,
          raisedHand: true,
          raisedHandTimestamp: parsed.timestamp,
        });
      } else if ('lowerAll' in parsed && parsed.lowerAll === true) {
        // Single moderator broadcast — clear the whole queue locally.
        storeActions.clear();
      } else {
        // For moderator lowers the target is the lowered participant, not the sender.
        const targetConnectionId =
          ('connectionId' in parsed && parsed.connectionId) || senderConnectionId;
        storeActions.removeHand(targetConnectionId);
      }
    },
    [getConnectionId, getParticipantName, storeActions]
  );

  const onConnectionCreated = useCallback(
    (connection: Connection) => {
      const send = signalRef.current;
      const localConnectionId = getConnectionId();
      if (!send || !localConnectionId) return;

      const localState = storeApi.getState().handsMap.get(localConnectionId);
      if (!localState) return;

      // Critical for late-joiners: when this unicast arrives, the new peer
      // hasn't subscribed to our stream yet, so their subscriber-wrapper
      // name lookup returns ''. We attach our display name so they can use
      // it directly instead of relying on a lookup that hasn't resolved.
      const payload: RaiseHandPayload = {
        raisedHand: true,
        timestamp: localState.raisedHandTimestamp,
        participantName: localState.participantName || localUserName,
      };
      send({
        type: RAISE_HAND_SIGNAL,
        data: JSON.stringify(payload),
        to: connection,
      });
    },
    [getConnectionId, localUserName, storeApi]
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
