import PeopleIcon from '@mui/icons-material/People';
import Tooltip from '@mui/material/Tooltip';
import { blue } from '@mui/material/colors';
import { Badge } from '@mui/material';
import { ReactElement } from 'react';
import ToolbarButton from '../ToolbarButton';
import useSessionContext from '../../../hooks/useSessionContext';

export type ParticipantListButtonProps = {
  handleClick: () => void;
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
 *   @property {number} participantCount - number of current participants in call, to be displayed in badge
 *   @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 * @returns {ReactElement} - ParticipantListButton
 */
const ParticipantListButton = ({
  handleClick,
  participantCount,
  isOverflowButton = false,
}: ParticipantListButtonProps): ReactElement => {
  const { rightPanelActiveTab } = useSessionContext();
  const isOpen = rightPanelActiveTab === 'participant-list';

  return (
    <Tooltip
      title={isOpen ? 'Close participant list' : 'Open participant list'}
      aria-label="toggle participant list"
    >
      <Badge
        badgeContent={participantCount}
        sx={{
          '& .MuiBadge-badge': {
            color: 'white',
            backgroundColor: 'rgb(95, 99, 104)',
          },
          marginRight: '12px',
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
