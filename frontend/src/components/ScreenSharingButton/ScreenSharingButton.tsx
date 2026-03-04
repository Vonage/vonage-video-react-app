import Tooltip from '@mui/material/Tooltip';
import { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isMobile } from '@web/platform';
import ToolbarButton from '../MeetingRoom/ToolbarButton';
import PopupDialog, { DialogTexts } from '../MeetingRoom/PopupDialog';
import VividIcon from '@components/VividIcon';
import useTheme from '@ui/theme';
import { env } from '../../env';

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
  const { t } = useTranslation();
  const theme = useTheme();
  const title = isSharingScreen ? t('screenSharing.title.stop') : t('screenSharing.title.start');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Screensharing relies on the getDisplayMedia browser API which is unsupported on mobile devices
  // See: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia#browser_compatibility
  const shouldDisplayScreenShareButton = !isMobile() && env.ALLOW_SCREEN_SHARE;

  const handleButtonClick = () =>
    isViewingScreenShare ? setIsModalOpen((prev) => !prev) : toggleScreenShare();

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const actionText: DialogTexts = {
    title: t('screenSharing.dialog.title'),
    contents: t('screenSharing.dialog.content'),
    primaryActionText: t('screenSharing.dialog.action'),
    secondaryActionText: t('button.cancel'),
  };

  const handleActionClick = () => {
    toggleScreenShare();
    handleClose();
  };

  return (
    shouldDisplayScreenShareButton && (
      <>
        <Tooltip title={title} aria-label={t('screenSharing.tooltip.ariaLabel')}>
          <ToolbarButton
            onClick={handleButtonClick}
            data-testid="screensharing-button"
            icon={
              !isSharingScreen ? (
                <VividIcon
                  name="screen-share-solid"
                  customSize={-5}
                  sx={{ color: theme.colors.onSecondary }}
                  data-testid="ScreenShareIcon"
                />
              ) : (
                <VividIcon
                  name="screen-share-off-solid"
                  customSize={-5}
                  sx={{ color: theme.colors.onSecondary }}
                  data-testid="ScreenShareIcon"
                />
              )
            }
            sx={{
              marginTop: isOverflowButton ? '0px' : '4px',
              marginLeft: isOverflowButton ? '12px' : '0px',
              backgroundColor: isSharingScreen
                ? `${theme.colors.onSecondary}55`
                : theme.colors.darkGrey,
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
