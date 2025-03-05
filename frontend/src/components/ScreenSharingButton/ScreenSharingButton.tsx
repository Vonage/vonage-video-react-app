import ScreenOff from '@mui/icons-material/StopScreenShare';
import ScreenShare from '@mui/icons-material/ScreenShare';
import Tooltip from '@mui/material/Tooltip';
import { ReactElement, useState } from 'react';
import ToolbarButton from '../MeetingRoom/ToolbarButton';
import PopupDialog, { DialogTexts } from '../MeetingRoom/PopupDialog';
import { isMobile } from '../../utils/util';

export type ScreenShareButtonProps = {
  toggleScreenShare: () => void;
  isSharingScreen: boolean;
  isViewingScreenShare: boolean;
  isOverflowButton?: boolean;
};

/**
 * ScreenSharingButton Component
 *
 * Button to toggle on a user's screenshare and to display whether a user is sharing their screen.
 * @param {ScreenShareButtonProps} props - The props for the component.
 *  @property {Function} toggleScreenShare - Function to toggle screenshare.
 *  @property {boolean} isSharingScreen - Whether the user is sharing their screen or not.
 *  @property {boolean} isViewingScreenShare - Indicates whether there is a screenshare currently in the session.
 *  @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 * @returns {ReactElement} - The ScreenSharingButton component
 */
const ScreenSharingButton = ({
  toggleScreenShare,
  isSharingScreen,
  isViewingScreenShare,
  isOverflowButton = false,
}: ScreenShareButtonProps): ReactElement | false => {
  const title = isSharingScreen ? 'Stop screen share' : 'Start screen share';
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleButtonClick = () =>
    isViewingScreenShare ? setIsModalOpen((prev) => !prev) : toggleScreenShare();

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const actionText: DialogTexts = {
    title: 'Do you want to share your screen?',
    contents:
      'Looks like there is someone else sharing their screen. If you continue, their screen is no longer going to be shared.',
    primaryActionText: 'Start sharing your screen',
    secondaryActionText: 'Cancel',
  };

  const handleActionClick = () => {
    toggleScreenShare();
    handleClose();
  };

  return (
    !isMobile() && (
      <>
        <Tooltip title={title} aria-label="add">
          <ToolbarButton
            onClick={handleButtonClick}
            data-testid="screensharing-button"
            icon={
              !isSharingScreen ? (
                <ScreenShare className="text-white" />
              ) : (
                <ScreenOff className="text-red-500" />
              )
            }
            sx={{
              // on the small view port devices we need to align the button
              marginTop: isOverflowButton ? '0px' : '4px',
              marginLeft: isOverflowButton ? '12px' : '0px',
            }}
            isOverflowButton={isOverflowButton}
          />
        </Tooltip>
        {isViewingScreenShare && (
          <PopupDialog
            isOpen={isModalOpen}
            handleClose={handleClose}
            handleActionClick={handleActionClick}
            actionText={actionText}
          />
        )}
      </>
    )
  );
};

export default ScreenSharingButton;
