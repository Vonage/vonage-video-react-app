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
  const autoLowerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasSpeakingRef = useRef<boolean>(false);

  // Refs so the timer callback always reads the latest values without
  // re-subscribing to publisherAudioLevel changes.
  const signalRef = useRef(signal);
  const getConnectionIdRef = useRef(getConnectionId);
  useEffect(() => {
    signalRef.current = signal;
    getConnectionIdRef.current = getConnectionId;
  }, [signal, getConnectionId]);

  useEffect(() => {
    const localConnectionId = getConnectionIdRef.current();
    const localHandUp = localConnectionId
      ? raisedHandsMapRef.current.get(localConnectionId)?.raisedHand === true
      : false;

    const isLocalSpeaking = publisherAudioLevel > SPEAKING_THRESHOLD;

    if (isLocalSpeaking && localHandUp && !wasSpeakingRef.current) {
      wasSpeakingRef.current = true;
      autoLowerTimerRef.current = setTimeout(() => {
        const currentSignal = signalRef.current;
        const currentLocalConnectionId = getConnectionIdRef.current();
        if (!currentLocalConnectionId || !currentSignal) return;
        const currentState = raisedHandsMapRef.current.get(currentLocalConnectionId);
        if (!currentState?.raisedHand) return;

        setRaisedHandsMap((prev) => {
          const next = new Map(prev);
          next.delete(currentLocalConnectionId);
          return next;
        });
        currentSignal({
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
