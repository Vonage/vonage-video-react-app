import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ToolbarButton from '../ToolbarButton';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import VividIcon from '@ui/components/VividIcon';
import { env } from '../../../env';
import { raiseHand$ } from '@core/stores';

export type ParticipantListButtonProps = {
  handleClick: () => void;
  isOpen: boolean;
  participantCount: number;
  isOverflowButton?: boolean;
};
/**
 * ParticipantListButton Component
 *
 * Toolbar button to open and close participant list
 * Also displays participant count badge
 * @param {ParticipantListButtonProps} props - the props for this component
 *   @property {() => void} handleClick - click handler to toggle open participant list
 *   @property {boolean} isOpen - true if list is currently open, false if not
 *   @property {number} participantCount - number of current participants in call, to be displayed in badge
 *   @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 * @returns {ReactElement} - ParticipantListButton
 */
const ParticipantListButton = ({
  handleClick,
  isOpen,
  participantCount,
  isOverflowButton = false,
}: ParticipantListButtonProps): ReactElement | false => {
  const { t } = useTranslation();
  const raisedHandCount = raiseHand$.useRaisedHandCount();

  return (
    env.SHOW_PARTICIPANT_LIST && (
      <Tooltip
        title={isOpen ? t('participants.list.close') : t('participants.list.open')}
        aria-label={t('participants.list.ariaLabel')}
      >
        <Badge
          className="[&_.MuiBadge-badge]:text-vera-on-tertiary [&_.MuiBadge-badge]:bg-vera-tertiary"
          badgeContent={participantCount}
          sx={{
            marginRight: '12px',
            zIndex: 1,
          }}
          overlap="circular"
        >
          <Box className="relative inline-flex">
            <ToolbarButton
              data-testid="participant-list-button"
              sx={{
                marginTop: '0px',
                marginRight: '0px',
              }}
              onClick={handleClick}
              icon={
                <VividIcon
                  name="group-solid"
                  customSize={-4}
                  data-testid="PeopleIcon"
                  style={{
                    color: isOpen ? 'var(--vera-secondary)' : 'var(--vera-on-secondary-light)',
                  }}
                />
              }
              isOverflowButton={isOverflowButton}
            />
            {env.ALLOW_RAISE_HAND && raisedHandCount > 0 && (
              <Box
                className="absolute bottom-0 right-0 flex h-4 min-w-[0.875rem] items-center justify-center gap-[0.35rem] rounded-full bg-vera-primary px-1 text-[10px] font-bold text-vera-on-primary"
                data-testid="participant-list-raised-hand-badge"
              >
                <VividIcon name="hand-solid" customSize={-6} className="text-vera-on-primary" />
                <span>{raisedHandCount}</span>
              </Box>
            )}
          </Box>
        </Badge>
      </Tooltip>
    )
  );
};

export default ParticipantListButton;
