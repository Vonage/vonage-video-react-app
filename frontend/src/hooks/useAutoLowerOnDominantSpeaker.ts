import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { RaiseHandState, SignalType } from '../types/session';

/** Duration (ms) the local user must be continuously speaking before their hand is auto-lowered. */
const AUTO_SPEAK_LOWER_THRESHOLD_MS = 2_000;

/** Publisher audio level (0–100) above which we consider the local user to be speaking. */
const SPEAKING_THRESHOLD = 10;

export type UseAutoLowerOnDominantSpeakerProps = {
  /** Publisher audio level as a 0–100 percentage (from useAudioLevels). */
  publisherAudioLevel: number;
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
 * Auto-lowers the local user's raised hand when they speak continuously
 * for longer than `AUTO_SPEAK_LOWER_THRESHOLD_MS` (2 s).
 *
 * Uses the publisher's audio level (from `useAudioLevels`) for direct
 * detection rather than the `ActiveSpeakerTracker` (which only tracks
 * remote subscribers and would false-positive on silence).
 *
 * Extracted from `useRaiseHand` so that each hook/component stays within the
 * project guideline of a single `useEffect`.
 */
export function useAutoLowerOnDominantSpeaker({
  publisherAudioLevel,
  getConnectionId,
  raisedHandsMapRef,
  signal,
  setRaisedHandsMap,
}: UseAutoLowerOnDominantSpeakerProps): void {
  // Track speaking timer for auto-lower
  const autoLowerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasSpeakingRef = useRef<boolean>(false);

  // -------------------------------------------------------------------------
  // Auto-lower: if local user speaks for >2 s while hand is raised
  // -------------------------------------------------------------------------
  useEffect(() => {
    const localConnectionId = getConnectionId();
    const localHandUp = localConnectionId
      ? raisedHandsMapRef.current.get(localConnectionId)?.raisedHand === true
      : false;

    const isLocalSpeaking = publisherAudioLevel > SPEAKING_THRESHOLD;

    if (isLocalSpeaking && localHandUp && !wasSpeakingRef.current) {
      // Start the 2-second timer
      wasSpeakingRef.current = true;
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
    } else if (!isLocalSpeaking || !localHandUp) {
      // Cancel any pending auto-lower timer
      wasSpeakingRef.current = false;
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
  }, [publisherAudioLevel]);
}
