import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSessionContext from '@hooks/useSessionContext';
import { useRaisedHands, useRaisedHandCount } from '../../../../stores/raiseHand';
import { isModeratorRole } from '../../../../utils/raiseHandRole';
import emojiMap from '../../../../utils/emojis';
import LowerAllDialog from './LowerAllDialog';

/**
 * Section at the top of the Participants panel listing raised hands in
 * queue order. Moderators can lower individual or all hands.
 */
const RaisedHandsSection = (): ReactElement => {
  const { t } = useTranslation();
  const { lowerHand, lowerAllHands } = useSessionContext();
  const raisedHands = useRaisedHands();
  const raisedHandCount = useRaisedHandCount();
  const [isLowerAllDialogOpen, setIsLowerAllDialogOpen] = useState(false);

  const handleLowerAllClick = () => setIsLowerAllDialogOpen(true);
  const handleLowerAllConfirm = () => {
    lowerAllHands();
    setIsLowerAllDialogOpen(false);
  };
  const handleLowerAllCancel = () => setIsLowerAllDialogOpen(false);

  return (
    <>
      <div
        className="flex items-center justify-between px-6 pb-1 pt-3"
        data-testid="raised-hands-section"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-vera-text-secondary">
            {t('raiseHand.section.title')}
          </span>
          <span
            data-testid="raised-hands-count-badge"
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-vera-primary px-1.5 text-[0.7rem] text-vera-on-primary"
          >
            {raisedHandCount}
          </span>
        </div>

        {isModeratorRole() && (
          <button
            type="button"
            data-testid="lower-all-button"
            onClick={handleLowerAllClick}
            className="cursor-pointer border-none bg-transparent p-0 text-[0.8rem] text-vera-text-primary hover:underline"
          >
            {t('raiseHand.section.lowerAll')}
          </button>
        )}
      </div>

      <ul className="m-0 list-none px-2 py-0">
        {raisedHands.map((state) => (
          <li
            key={state.connectionId}
            data-testid={`raised-hand-item-${state.connectionId}`}
            className={`flex items-center py-1 pl-4 ${isModeratorRole() ? 'pr-12' : 'pr-2'}`}
          >
            <span className="flex-1 truncate text-sm">{state.participantName}</span>
            {isModeratorRole() && (
              <button
                type="button"
                aria-label={t('raiseHand.section.lowerParticipant', {
                  name: state.participantName,
                })}
                data-testid={`lower-hand-${state.connectionId}`}
                onClick={() => lowerHand(state.connectionId)}
                className="cursor-pointer border-none bg-transparent p-1 text-base text-vera-text-tertiary hover:opacity-80"
                title={t('raiseHand.section.lowerParticipant', { name: state.participantName })}
              >
                <span role="img" aria-hidden="true">
                  {emojiMap.RAISED_HAND}
                </span>
              </button>
            )}
          </li>
        ))}
      </ul>

      <hr className="mx-4 mt-2 border-vera-border" />

      <LowerAllDialog
        open={isLowerAllDialogOpen}
        raisedHandCount={raisedHandCount}
        onConfirm={handleLowerAllConfirm}
        onCancel={handleLowerAllCancel}
      />
    </>
  );
};

export default RaisedHandsSection;
