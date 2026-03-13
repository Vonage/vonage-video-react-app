import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ToolbarButton from '../ToolbarButton';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';
import VividIcon from '@components/VividIcon';
import { env } from '../../../env';
import useSessionContext from '@hooks/useSessionContext';

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
  const theme = useTheme();
  const { t } = useTranslation();
  const { raisedHandCount } = useSessionContext();

  return (
    env.SHOW_PARTICIPANT_LIST && (
      <Tooltip
        title={isOpen ? t('participants.list.close') : t('participants.list.open')}
        aria-label={t('participants.list.ariaLabel')}
      >
        {/* Outer badge: raised-hand count indicator (primary colour) */}
        <Badge
          badgeContent={raisedHandCount > 0 ? '✋' : null}
          invisible={raisedHandCount === 0}
          data-testid="raised-hand-count-badge"
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.6rem',
              minWidth: '16px',
              height: '16px',
              padding: '0 2px',
              backgroundColor: theme.colors.primary,
              color: theme.colors.onPrimary,
            },
            marginRight: '12px',
            zIndex: 1,
          }}
        >
          {/* Inner badge: participant count (tertiary colour) */}
          <Badge
            badgeContent={participantCount}
            sx={{
              '& .MuiBadge-badge': {
                color: theme.colors.onTertiary,
                backgroundColor: theme.colors.tertiary,
              },
            }}
            overlap="circular"
          >
            <ToolbarButton
              data-testid="participant-list-button"
              sx={{
                marginTop: '0px',
                marginRight: '0px',
              }}
              onClick={handleClick}
              icon={
                <Box sx={{ position: 'relative', display: 'flex' }}>
                  <VividIcon
                    name="group-solid"
                    customSize={-4}
                    data-testid="PeopleIcon"
                    sx={{ color: isOpen ? theme.colors.secondary : theme.colors.onSecondary }}
                  />
                </Box>
              }
              isOverflowButton={isOverflowButton}
            />
          </Badge>
        </Badge>
      </Tooltip>
    )
  );
};

export default ParticipantListButton;
