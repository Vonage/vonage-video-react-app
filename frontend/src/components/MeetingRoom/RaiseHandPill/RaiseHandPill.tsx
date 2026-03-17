import { ReactElement, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import useSessionContext from '@hooks/useSessionContext';

const MAX_POPOVER_NAMES = 3;

/**
 * RaiseHandPill Component
 *
 * A persistent ambient indicator rendered in the MeetingRoom header area.
 * Visible whenever raisedHandCount > 0. Shows the name of the first participant
 * in the queue (earliest timestamp).
 *
 * - Click → opens the Participants panel to view the full queue.
 * - Hover → shows a floating mini-popover: first 3 names + "View all (N) >" CTA.
 */
const RaiseHandPill = (): ReactElement => {
  const { t } = useTranslation();
  const { raisedHands, raisedHandCount, toggleParticipantList } = useSessionContext();
  const [hoverOpen, setHoverOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const firstInQueue = raisedHands[0];

  return (
    <>
      <button
        type="button"
        ref={anchorRef}
        data-testid="raise-hand-pill"
        onClick={toggleParticipantList}
        onMouseEnter={() => setHoverOpen(true)}
        onMouseLeave={() => setHoverOpen(false)}
        aria-label={t('raiseHand.pill.ariaLabel', { name: firstInQueue?.participantName ?? '' })}
        className="fixed left-1/2 top-4 z-[1200] flex -translate-x-1/2 cursor-pointer items-center gap-1.5 rounded-full border-none bg-vera-primary px-3 py-1.5 text-vera-on-primary shadow-[0_2px_8px_var(--vera-dark-grey-opacity)] animate-[pillFadeIn_200ms_ease-out_both] hover:bg-vera-primary-hover"
      >
        <span aria-hidden="true" className="text-base">
          ✋
        </span>
        <span className="text-xs font-semibold">{firstInQueue?.participantName}</span>
        {raisedHandCount > 1 && (
          <span className="ml-0.5 text-xs opacity-80">+{raisedHandCount - 1}</span>
        )}
      </button>

      {/* Hover popover */}
      <Popper
        open={hoverOpen}
        anchorEl={anchorRef.current}
        placement="bottom"
        transition
        className="z-[1201]"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <div
              data-testid="raise-hand-pill-popover"
              onMouseEnter={() => setHoverOpen(true)}
              onMouseLeave={() => setHoverOpen(false)}
              className="mt-1 min-w-[180px] max-w-[240px] overflow-hidden rounded-lg bg-vera-dark-grey text-vera-on-dark-grey shadow-lg"
            >
              <div className="px-4 pb-1 pt-3">
                <span className="text-xs font-bold uppercase opacity-70">
                  {t('raiseHand.pill.popoverTitle')}
                </span>
              </div>
              <ul className="m-0 list-none p-0">
                {raisedHands.slice(0, MAX_POPOVER_NAMES).map((h) => (
                  <li key={h.connectionId} className="flex items-center px-4 py-0.5">
                    <span aria-hidden="true" className="mr-2">
                      ✋
                    </span>
                    <span className="truncate text-sm">{h.participantName}</span>
                  </li>
                ))}
              </ul>
              {raisedHandCount > MAX_POPOVER_NAMES && (
                <div className="px-4 pb-3 pt-1">
                  <button
                    type="button"
                    onClick={toggleParticipantList}
                    className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-vera-primary hover:underline"
                  >
                    {t('raiseHand.pill.viewAll', { count: raisedHandCount })} &rsaquo;
                  </button>
                </div>
              )}
            </div>
          </Fade>
        )}
      </Popper>
    </>
  );
};

export default RaiseHandPill;
