import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import useSessionContext from '@hooks/useSessionContext';

/** Duration (ms) after which a toast auto-dismisses. */
const TOAST_DURATION_MS = 4_000;

/** Window (ms) within which multiple raises are coalesced into a single toast. */
const COALESCE_WINDOW_MS = 2_000;

/** Optional audio chime on the first hand raised in a session. */
const CHIME_ENABLED = true;
const CHIME_FREQUENCY = 660;
const CHIME_DURATION = 0.18;

type ToastState = {
  open: boolean;
  message: string;
  /** If set — this toast is telling the local user their hand was lowered by someone else. */
  isLoweredByModerator?: boolean;
};

/**
 * RaiseHandToast Component
 *
 * Listens to `raisedHands` from the session context and displays:
 * - A toast to all participants when a REMOTE participant raises their hand.
 *   Multiple raises within a 2-second window are coalesced into a single message.
 * - A separate toast to the local user when a moderator has lowered their hand.
 *
 * A "View queue" CTA opens the participants panel.
 * An optional audio chime plays on the first raise in a session.
 */
const RaiseHandToast = (): ReactElement => {
  const { t } = useTranslation();
  const { raisedHands, raisedHandCount, toggleParticipantList, getConnectionId } =
    useSessionContext();

  const [toast, setToast] = useState<ToastState>({ open: false, message: '' });

  // Track previously-seen raised hands for delta detection
  const prevRaisedHandsRef = useRef<typeof raisedHands>([]);

  // Coalescing: pending raises to be batched into one toast
  const pendingNewRaisesRef = useRef<string[]>([]);
  const coalesceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Chime: track whether chime has fired this session
  const hasChimedRef = useRef<boolean>(false);

  // -------------------------------------------------------------------------
  // Audio chime helper
  // -------------------------------------------------------------------------

  const playChime = useCallback(() => {
    if (!CHIME_ENABLED) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(CHIME_FREQUENCY, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + CHIME_DURATION);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + CHIME_DURATION);
    } catch {
      // AudioContext not available in test environments — ignore silently.
    }
  }, []);

  // -------------------------------------------------------------------------
  // Flush coalesced raises into one toast
  // -------------------------------------------------------------------------

  const flushPendingRaises = useCallback(() => {
    const names = pendingNewRaisesRef.current;
    pendingNewRaisesRef.current = [];
    coalesceTimerRef.current = null;

    if (names.length === 0) return;

    const message =
      names.length === 1
        ? t('raiseHand.toast.singleRaised', { name: names[0] })
        : t('raiseHand.toast.multipleRaised', { count: names.length });

    setToast({ open: true, message });
  }, [t]);

  // -------------------------------------------------------------------------
  // Watch raisedHands for new raises (remote participants only)
  // -------------------------------------------------------------------------

  useEffect(() => {
    const prev = prevRaisedHandsRef.current;
    const prevIds = new Set(prev.map((h) => h.connectionId));

    // Find hands that are new compared to previous render
    const newlyRaised = raisedHands.filter((h) => !prevIds.has(h.connectionId));

    // Filter out the local user's own raise (do not toast to yourself)
    const localConnectionId = getConnectionId();
    const remoteNewlyRaised = newlyRaised.filter((h) => h.connectionId !== localConnectionId);

    if (remoteNewlyRaised.length > 0) {
      // Chime logic — once per session (resets when count drops to 0)
      if (!hasChimedRef.current) {
        hasChimedRef.current = true;
        playChime();
      }

      // Add names to pending batch
      remoteNewlyRaised.forEach((h) => pendingNewRaisesRef.current.push(h.participantName));

      // Start / reset the coalesce timer
      if (coalesceTimerRef.current) clearTimeout(coalesceTimerRef.current);
      coalesceTimerRef.current = setTimeout(flushPendingRaises, COALESCE_WINDOW_MS);
    }

    // Reset chime sentinel when all hands drop to 0
    if (raisedHandCount === 0) {
      hasChimedRef.current = false;
    }

    prevRaisedHandsRef.current = raisedHands;

    // Cleanup: clear any pending coalesce timer (also runs on unmount)
    return () => {
      if (coalesceTimerRef.current) clearTimeout(coalesceTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raisedHands]);

  const handleClose = () => setToast((prev) => ({ ...prev, open: false }));

  const handleViewQueue = () => {
    toggleParticipantList();
    handleClose();
  };

  return (
    <Snackbar
      open={toast.open}
      autoHideDuration={TOAST_DURATION_MS}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      data-testid="raise-hand-toast"
      className="mb-12"
    >
      <SnackbarContent
        className="flex items-center bg-vera-dark-grey text-vera-on-dark-grey"
        message={
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="text-lg leading-none">
              ✋
            </span>
            <span className="text-sm">{toast.message}</span>
          </span>
        }
        action={
          <span className="flex items-center gap-1">
            {!toast.isLoweredByModerator && (
              <button
                type="button"
                onClick={handleViewQueue}
                data-testid="raise-hand-toast-view-queue"
                className="cursor-pointer border-none bg-transparent px-2 py-1 text-sm font-semibold text-vera-primary hover:underline"
              >
                {t('raiseHand.toast.viewQueue')}
              </button>
            )}
            <button
              type="button"
              aria-label={t('button.close')}
              onClick={handleClose}
              className="cursor-pointer rounded-full border-none bg-transparent p-1 text-vera-on-dark-grey hover:opacity-80"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </span>
        }
      />
    </Snackbar>
  );
};

export default RaiseHandToast;
