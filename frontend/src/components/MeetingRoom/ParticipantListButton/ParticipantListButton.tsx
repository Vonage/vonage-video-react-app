import PeopleIcon from '@mui/icons-material/People';
import Tooltip from '@mui/material/Tooltip';
import { blue } from '@mui/material/colors';
import { Badge } from '@mui/material';
import { ReactElement } from 'react';
import ToolbarButton from '../ToolbarButton';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type ParticipantListButtonProps = {
  handleClick: () => void;
  isOpen: boolean;
  participantCount: number;
  handleClickAway?: () => void;
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
 *   @property {() => void} handleClickAway - click handler that closes the overflow menu in small view port devices
 * @returns {ReactElement} - ParticipantListButton
 */
const ParticipantListButton = ({
  handleClick,
  isOpen,
  participantCount,
  handleClickAway,
}: ParticipantListButtonProps): ReactElement => {
  const isSmallViewport = useIsSmallViewport();
  const handleClose = () => {
    handleClick();
    if (isSmallViewport && handleClickAway) {
      handleClickAway();
    }
  };
  return (
    <div className="pr-3">
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
          }}
          overlap="circular"
        >
          <ToolbarButton
            data-testid="participant-list-button"
            sx={{
              marginTop: '0px',
              marginRight: '0px',
            }}
            onClick={handleClose}
            icon={<PeopleIcon sx={{ color: isOpen ? blue.A100 : 'white' }} />}
            isSmallViewPort={isSmallViewport}
          />
        </Badge>
      </Tooltip>
    </div>
  );
};

export default ParticipantListButton;
