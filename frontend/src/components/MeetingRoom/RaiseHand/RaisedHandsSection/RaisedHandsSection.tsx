import { MouseEvent, ReactElement, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSessionContext from '@hooks/useSessionContext';
import { useRaisedHands } from '@core/stores';
import { RAISED_HAND_EMOJI } from '../../../../utils/emojis';
import LowerAllDialog from './LowerAllDialog';

// v1: every participant is a moderator and may lower other participants'
// hands. VERA does not yet have a server-side role model; lowering uses the
// same broadcast signal channel as raising, so there is no privileged
// backend path. When real roles ship, replace this constant with the actual
// check — every moderator-gated branch below reads from `IS_MODERATOR`.
const IS_MODERATOR = true;

/**
 * Section at the top of the Participants panel listing raised hands in
 * queue order. Moderators can lower individual or all hands.
 */
const RaisedHandsSection = (): ReactElement => {
  const { t } = useTranslation();
  const { lowerHand, lowerAllHands } = useSessionContext();
  const raisedHands = useRaisedHands();
  const [isLowerAllDialogOpen, setIsLowerAllDialogOpen] = useState(false);

  const handleLowerAllClick = () => setIsLowerAllDialogOpen(true);
  const handleLowerAllConfirm = () => {
    lowerAllHands();
    setIsLowerAllDialogOpen(false);
  };
  const handleLowerAllCancel = () => setIsLowerAllDialogOpen(false);

  // Single stable handler shared by every row — reads the target connection
  // ID from the button's data attribute. Avoids creating a new arrow per row
  // on every render (`onClick={() => lowerHand(state.connectionId)}`).
  const handleLowerParticipantClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const connectionId = event.currentTarget.dataset.connectionId;
      if (connectionId) lowerHand(connectionId);
    },
    [lowerHand]
  );

  return (
    <>
      <div
        className="flex items-center justify-between px-6 pb-1 pt-3"
        data-testid="raised-hands-section"
      >
        <div className="flex items-center gap-2">
          <span className="text-vera-body-base-semibold text-vera-text-secondary">
            {t('raiseHand.section.title')}
          </span>
          <span
            data-testid="raised-hands-count-badge"
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-vera-primary px-1.5 text-vera-caption text-vera-on-primary"
          >
            {raisedHands.length}
          </span>
        </div>

        {IS_MODERATOR && (
          <button
            type="button"
            data-testid="lower-all-button"
            onClick={handleLowerAllClick}
            className="cursor-pointer border-none bg-transparent p-0 text-vera-caption text-vera-text-primary hover:underline"
          >
            {t('raiseHand.section.lowerAll')}
          </button>
        )}
      </div>

      {/*
        `p-0` kills the browser-default `<ul>` `padding-inline-start: 40px` that
        was pushing every raised-hand row ~40px to the right of the section
        header — `px-2` is `padding-left: 0.5rem` (physical), which in some
        browsers doesn't reliably win the cascade over the user-agent logical-
        property default. Each row now carries its full indent on `<li>`.
      */}
      <ul className="m-0 max-h-[200px] list-none overflow-y-auto p-0">
        {raisedHands.map((state) => {
          const lowerLabel = t('raiseHand.section.lowerParticipant', {
            name: state.participantName,
          });
          return (
            <li
              key={state.connectionId}
              data-testid={`raised-hand-item-${state.connectionId}`}
              // `pl-[60px]` aligns the name with the participant names below the
              // divider: MUI ListItem's 16px gutter + 32px avatar + 12px name
              // margin = 60px from panel-left. `pr-[68px]` mirrors the
              // ParticipantListItem's `paddingRight: '68px'` so the lower-hand
              // button sits under the same column as the audio / menu icons.
              className={`flex items-center py-1 pl-[60px] ${IS_MODERATOR ? 'pr-[68px]' : 'pr-2'}`}
            >
              {/*
                `min-w-0` is the canonical Safari fix for `flex-1` + `truncate`:
                without it WebKit uses `min-width: auto` (the intrinsic content
                width) on the flex item, which fights `white-space: nowrap` and
                pushes the text out of view rather than truncating it.
                `text-left` is defensive — the panel sits inside MUI Box trees
                that occasionally inject `text-align: center` higher up.
              */}
              <span className="min-w-0 flex-1 truncate text-left text-vera-body-base">
                {state.participantName}
              </span>
              {IS_MODERATOR && (
                <button
                  type="button"
                  aria-label={lowerLabel}
                  title={lowerLabel}
                  data-testid={`lower-hand-${state.connectionId}`}
                  data-connection-id={state.connectionId}
                  onClick={handleLowerParticipantClick}
                  className="cursor-pointer border-none bg-transparent p-1 text-vera-body-extended text-vera-text-tertiary hover:opacity-80"
                >
                  <span role="img" aria-hidden="true">
                    {RAISED_HAND_EMOJI}
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <hr className="mx-4 mt-2 border-vera-border" />

      <LowerAllDialog
        open={isLowerAllDialogOpen}
        raisedHandCount={raisedHands.length}
        onConfirm={handleLowerAllConfirm}
        onCancel={handleLowerAllCancel}
      />
    </>
  );
};

export default RaisedHandsSection;
