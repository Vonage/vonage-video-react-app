import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { RaiseHandState, SignalType } from '../types/session';

/** Duration (ms) the local user must be dominant speaker before their hand is auto-lowered. */
const AUTO_SPEAK_LOWER_THRESHOLD_MS = 2_000;

export type UseAutoLowerOnDominantSpeakerProps = {
  /** Current active speaker subscriber id (undefined = local publisher is dominant speaker). */
  activeSpeakerId: string | undefined;
  /** Returns the connection ID of the local user. */
  getConnectionId: () => string | undefined;
  /** Ref to the live raised-hands map (avoids stale closure on the timer callback). */
  raisedHandsMapRef: React.RefObject<Map<string, RaiseHandState>>;
  /** Function to send a signal (broadcast or unicast). */
  signal: ((data: SignalType) => void) | undefined;
  /** State setter for the raised-hands map. */
  setRaisedHandsMap: Dispatch<SetStateAction<Map<string, RaiseHandState>>>;
};

/**
 * Auto-lowers the local user's raised hand when they become the dominant
 * speaker for longer than `AUTO_SPEAK_LOWER_THRESHOLD_MS` (2 s).
 *
 * Extracted from `useRaiseHand` so that each hook/component stays within the
 * project guideline of a single `useEffect`.
 */
export function useAutoLowerOnDominantSpeaker({
  activeSpeakerId,
  getConnectionId,
  raisedHandsMapRef,
  signal,
  setRaisedHandsMap,
}: UseAutoLowerOnDominantSpeakerProps): void {
  // Track active-speaker timer for auto-lower
  const autoLowerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasActiveSpeakerRef = useRef<boolean>(false);

  // -------------------------------------------------------------------------
  // Auto-lower: if local user is dominant speaker for >2 s while hand raised
  // -------------------------------------------------------------------------
  useEffect(() => {
    // activeSpeakerId is the subscriber-wrapper id. A value of `undefined`
    // typically means the local publisher is the dominant speaker (no remote
    // subscriber has taken over).
    const localConnectionId = getConnectionId();
    const localHandUp = localConnectionId
      ? raisedHandsMapRef.current.get(localConnectionId)?.raisedHand === true
      : false;

    const isLocalDominant = activeSpeakerId === undefined;

    if (isLocalDominant && localHandUp && !wasActiveSpeakerRef.current) {
      // Start the 2-second timer
      wasActiveSpeakerRef.current = true;
      autoLowerTimerRef.current = setTimeout(() => {
        const currentLocalConnectionId = getConnectionId();
        if (!currentLocalConnectionId || !signal) return;
        const currentState = raisedHandsMapRef.current.get(currentLocalConnectionId);
        if (!currentState?.raisedHand) return;

        // Auto-lower with 'auto-speak' marker
        setRaisedHandsMap((prev) => {
          const next = new Map(prev);
          next.delete(currentLocalConnectionId);
          return next;
        });
        signal({
          type: 'raiseHand',
          data: JSON.stringify({
            raisedHand: false,
            timestamp: null,
            loweredBy: 'auto-speak',
            connectionId: currentLocalConnectionId,
          }),
        });
      }, AUTO_SPEAK_LOWER_THRESHOLD_MS);
    } else if (!isLocalDominant || !localHandUp) {
      // Cancel any pending auto-lower timer
      wasActiveSpeakerRef.current = false;
      if (autoLowerTimerRef.current) {
        clearTimeout(autoLowerTimerRef.current);
        autoLowerTimerRef.current = null;
      }
    }

    return () => {
      if (autoLowerTimerRef.current) {
        clearTimeout(autoLowerTimerRef.current);
        autoLowerTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSpeakerId]);
}
