import { MouseEvent, ReactElement, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import useSessionContext from '@hooks/useSessionContext';
import { useRaisedHands } from '@core/stores';
import getInitials from '@utils/getInitials';
import getParticipantColor from '@utils/getParticipantColor';
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
              // Mirrors `ParticipantListItem`'s layout so the row visually
              // matches the rows below the divider: 16px left gutter (MUI
              // ListItem default), then a 32px Avatar with 12px right margin,
              // then the name. Row height matches `h-14` (= 56px) too. The
              // lower-hand button is rendered as an absolutely-positioned
              // secondary action (MUI ListItem's pattern) so it sits at the
              // same right-column x-position as the participant rows' audio
              // / menu icons below.
              className={`relative flex h-14 items-center pl-4 ${IS_MODERATOR ? 'pr-[68px]' : 'pr-2'}`}
            >
              <Avatar
                sx={{
                  bgcolor: getParticipantColor(state.participantName),
                  width: '32px',
                  height: '32px',
                  fontSize: '14px',
                }}
              >
                {getInitials(state.participantName)}
              </Avatar>
              {/*
                `variant="body1"` matches `ParticipantListItem`'s name
                Typography exactly (1rem) so the two lists look uniform.
                `minWidth: 0` is the canonical Safari fix for `flex: 1` +
                truncate (`noWrap`): without it WebKit uses `min-width: auto`
                (= intrinsic content width) and the name overflows the row
                rather than truncating.
              */}
              <Typography
                variant="body1"
                noWrap
                sx={{ marginLeft: '12px', minWidth: 0, flex: 1, textAlign: 'left' }}
              >
                {state.participantName}
              </Typography>
              {IS_MODERATOR && (
                // Absolutely positioned to match MUI ListItem's `secondaryAction`
                // column on the rows below: `right: 16px` lands the icon at
                // the same x as the audio/menu icons in `ParticipantListItem`,
                // independent of the participant name length.
                <button
                  type="button"
                  aria-label={lowerLabel}
                  title={lowerLabel}
                  data-testid={`lower-hand-${state.connectionId}`}
                  data-connection-id={state.connectionId}
                  onClick={handleLowerParticipantClick}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer border-none bg-transparent p-1 text-vera-body-extended text-vera-text-tertiary hover:opacity-80"
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
