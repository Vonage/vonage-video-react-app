import PeopleIcon from '@mui/icons-material/People';
import Tooltip from '@mui/material/Tooltip';
import { blue } from '@mui/material/colors';
import { Badge } from '@mui/material';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ToolbarButton from '../ToolbarButton';

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
}: ParticipantListButtonProps): ReactElement => {
  const { t } = useTranslation();
  return (
    <Tooltip
      title={isOpen ? t('participants.list.close') : t('participants.list.open')}
      aria-label={t('participants.list.ariaLabel')}
    >
      <Badge
        badgeContent={participantCount}
        sx={{
          '& .MuiBadge-badge': {
            color: 'white',
            backgroundColor: 'rgb(95, 99, 104)',
          },
          marginRight: '12px',
          zIndex: 1,
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
          icon={<PeopleIcon sx={{ color: isOpen ? blue.A100 : 'white' }} />}
          isOverflowButton={isOverflowButton}
        />
      </Badge>
    </Tooltip>
  );
};

export default ParticipantListButton;
