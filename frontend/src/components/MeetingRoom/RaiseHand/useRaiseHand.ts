import type { Connection } from '@vonage/client-sdk-video';
import type { SignalEvent, SignalType } from '@app-types/session';
import { tryCatch } from '@common/execution';
import { raiseHand$ } from '@core/stores';
import useStableCallback from '@web/hooks/useStableCallback';

export type UseRaiseHandProps = {
  signal: ((data: SignalType) => void) | undefined;
  getConnectionId: () => string | undefined;
};

export type UseRaiseHand = {
  raiseHand: () => void;
  lowerHand: () => void;
  onRaiseHandSignal: (event: SignalEvent) => void;
  onConnectionCreated: (connection: Connection) => void;
  onConnectionDestroyed: (connectionId: string) => void;
};

type RaiseHandPayload = { raisedHand: boolean; timestamp: number };

/**
 * Validates a raise-hand signal payload.
 * @param parsed - The parsed signal data.
 * @returns Whether the payload is a valid raise-hand payload.
 */
const isRaiseHandPayload = (parsed: unknown): parsed is RaiseHandPayload => {
  if (!parsed || typeof parsed !== 'object') return false;

  const { raisedHand, timestamp } = parsed as { raisedHand?: unknown; timestamp?: unknown };

  return typeof raisedHand === 'boolean' && Number.isFinite(timestamp);
};

/**
 * React hook that provides raise-hand signaling and signal reception.
 *
 * - `raiseHand` / `lowerHand` update the store optimistically and broadcast a signal.
 * - `onRaiseHandSignal` receives raise-hand signals from other participants and
 *   updates the `raiseHand$` store (own raise echoes are ignored).
 * - `onConnectionCreated` sends the local raised hand directly (with its original
 *   timestamp) to a newly joined participant, so late joiners see the queue.
 * - `onConnectionDestroyed` lowers the hand of a participant who left the session.
 *
 * All callbacks are stable, so they can be registered once on the video client
 * and still see the latest `signal` after a reconnect.
 * @param props - The hook properties.
 * @param props.signal - Function to send a signal to the session (may be undefined pre-connect).
 * @param props.getConnectionId - Returns the local connection ID (may be undefined pre-connect).
 * @returns Functions to raise/lower hand and handle incoming session events.
 */
const useRaiseHand = ({ signal, getConnectionId }: UseRaiseHandProps): UseRaiseHand => {
  const sendRaiseHandSignal = useStableCallback((raisedHand: boolean) => {
    const localConnectionId = getConnectionId();
    if (!signal) return;

    // Optimistic local store update — the echoed signal from the session is
    // ignored in onRaiseHandSignal, so the store must be updated here.
    if (localConnectionId && raisedHand) {
      raiseHand$.actions.raiseHand({ connectionId: localConnectionId });
    }

    if (localConnectionId && !raisedHand) {
      raiseHand$.actions.lowerHand({ connectionId: localConnectionId });
    }

    const payload: RaiseHandPayload = { raisedHand, timestamp: Date.now() };

    signal({ type: 'raiseHand', data: JSON.stringify(payload) });
  });

  const raiseHand = useStableCallback(() => sendRaiseHandSignal(true));

  const lowerHand = useStableCallback(() => sendRaiseHandSignal(false));

  const onRaiseHandSignal = useStableCallback((event: SignalEvent) => {
    const { data, from: sendingConnection } = event;
    if (!data || !sendingConnection) return;

    const { result: parsed, error } = tryCatch((): unknown => JSON.parse(data));
    if (error || !isRaiseHandPayload(parsed)) return;

    const senderConnectionId = sendingConnection.connectionId;
    const isOwnSignal = senderConnectionId === getConnectionId();
    const { raisedHand, timestamp } = parsed;

    // The optimistic write in sendRaiseHandSignal already covers our own raise.
    if (raisedHand && isOwnSignal) return;

    if (raisedHand) {
      raiseHand$.actions.raiseHand({ connectionId: senderConnectionId, raisedAt: timestamp });
      return;
    }

    raiseHand$.actions.lowerHand({ connectionId: senderConnectionId });
  });

  const onConnectionCreated = useStableCallback((connection: Connection) => {
    const localConnectionId = getConnectionId();
    if (!signal || !localConnectionId) return;

    const localRaisedHand = raiseHand$.getState().raisedHands[localConnectionId];
    if (!localRaisedHand) return;

    const payload: RaiseHandPayload = { raisedHand: true, timestamp: localRaisedHand.raisedAt };

    signal({ type: 'raiseHand', data: JSON.stringify(payload), to: connection });
  });

  const onConnectionDestroyed = useStableCallback((connectionId: string) => {
    raiseHand$.actions.lowerHand({ connectionId });
  });

  return { raiseHand, lowerHand, onRaiseHandSignal, onConnectionCreated, onConnectionDestroyed };
};

export default useRaiseHand;
