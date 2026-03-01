import Tooltip from '@mui/material/Tooltip';
import { ReactElement, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VideoContentHint } from '@vonage/client-sdk-video';
import { isMobile } from '@web/platform';
import ToolbarButton from '../MeetingRoom/ToolbarButton';
import PopupDialog, { DialogTexts } from '../MeetingRoom/PopupDialog';
import ContentHintMenu from './ContentHintMenu';
import VividIcon from '@components/VividIcon';
import useTheme from '@ui/theme';
import { env } from '../../env';

export type ScreenShareButtonProps = {
  toggleScreenShare: (hint?: VideoContentHint) => void;
  isSharingScreen: boolean;
  isViewingScreenShare: boolean;
  isOverflowButton?: boolean;
  changeContentHint: (hint: VideoContentHint) => void;
  currentContentHint: VideoContentHint;
};

/**
 * ScreenSharingButton Component
 *
 * Button to toggle on a user's screenshare and to display whether a user is sharing their screen.
 * Before starting a share, an intermediate ContentHintMenu popover allows the user to select a
 * videoContentHint optimization mode (Auto, Motion, Detail, Text). While sharing, hovering over
 * the button reopens the popover to change the hint on the fly.
 * @param {ScreenShareButtonProps} props - The props for the component.
 *  @property {Function} toggleScreenShare - Function to toggle screenshare, accepts an optional content hint.
 *  @property {boolean} isSharingScreen - Whether the user is sharing their screen or not.
 *  @property {boolean} isViewingScreenShare - Indicates whether there is a screenshare currently in the session.
 *  @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 *  @property {Function} changeContentHint - Applies a new videoContentHint to the live screen share publisher.
 *  @property {VideoContentHint} currentContentHint - The currently active videoContentHint.
 * @returns {ReactElement} - The ScreenSharingButton component
 */
const ScreenSharingButton = ({
  toggleScreenShare,
  isSharingScreen,
  isViewingScreenShare,
  isOverflowButton = false,
  changeContentHint,
  currentContentHint,
}: ScreenShareButtonProps): ReactElement | false => {
  const { t } = useTranslation();
  const theme = useTheme();

  const buttonRef = useRef<HTMLButtonElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isContentHintMenuOpen, setIsContentHintMenuOpen] = useState<boolean>(false);
  const [selectedHint, setSelectedHint] = useState<VideoContentHint>('');

  const title = isSharingScreen ? t('screenSharing.title.stop') : t('screenSharing.title.start');

  // Screensharing relies on the getDisplayMedia browser API which is unsupported on mobile devices
  // See: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia#browser_compatibility
  const shouldDisplayScreenShareButton = !isMobile() && env.ALLOW_SCREEN_SHARE;

  const handleButtonClick = () => {
    if (isSharingScreen) {
      // If the ContentHintMenu is open, close it without stopping the share
      if (isContentHintMenuOpen) {
        setIsContentHintMenuOpen(false);
        return;
      }
      // Otherwise stop sharing (existing behavior)
      toggleScreenShare();
      return;
    }
    // Not sharing: open ContentHintMenu so the user can pick a content hint
    setSelectedHint('detail');
    setIsContentHintMenuOpen(true);
  };

  const handleButtonMouseEnter = () => {
    if (!isSharingScreen) {
      return;
    }
    // While sharing: cancel any pending close timer and open the menu with the current hint
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setSelectedHint(currentContentHint);
    setIsContentHintMenuOpen(true);
  };

  const handleButtonMouseLeave = () => {
    if (!isSharingScreen) {
      return;
    }
    // Start a close timer so the menu stays open if the mouse moves directly onto it
    hoverTimerRef.current = setTimeout(() => {
      setIsContentHintMenuOpen(false);
    }, 200);
  };

  const handleMenuMouseEnter = () => {
    // Cancel the close timer when mouse enters the menu
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handleMenuMouseLeave = () => {
    // Start close timer when the mouse leaves the menu
    hoverTimerRef.current = setTimeout(() => {
      setIsContentHintMenuOpen(false);
    }, 200);
  };

  const handleContentHintMenuClose = () => {
    setIsContentHintMenuOpen(false);
  };

  const handleClickAwayMenu = () => {
    setIsContentHintMenuOpen(false);
  };

  const handleShareFromMenu = () => {
    setIsContentHintMenuOpen(false);
    if (isViewingScreenShare) {
      // Another participant is sharing — show confirmation dialog
      setIsModalOpen(true);
    } else {
      toggleScreenShare(selectedHint);
    }
  };

  const handleApplyFromMenu = () => {
    changeContentHint(selectedHint);
    setIsContentHintMenuOpen(false);
  };

  const handlePopupDialogClose = () => {
    setIsModalOpen(false);
  };

  const actionText: DialogTexts = {
    title: t('screenSharing.dialog.title'),
    contents: t('screenSharing.dialog.content'),
    primaryActionText: t('screenSharing.dialog.action'),
    secondaryActionText: t('button.cancel'),
  };

  const handlePopupDialogActionClick = () => {
    toggleScreenShare(selectedHint);
    handlePopupDialogClose();
  };

  return (
    shouldDisplayScreenShareButton && (
      <>
        <Tooltip title={title} aria-label={t('screenSharing.tooltip.ariaLabel')}>
          <ToolbarButton
            ref={buttonRef}
            onClick={handleButtonClick}
            onMouseEnter={handleButtonMouseEnter}
            onMouseLeave={handleButtonMouseLeave}
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
        <ContentHintMenu
          anchorRef={buttonRef}
          isOpen={isContentHintMenuOpen}
          isSharingScreen={isSharingScreen}
          selectedHint={selectedHint}
          currentContentHint={currentContentHint}
          onHintChange={setSelectedHint}
          onShare={handleShareFromMenu}
          onApply={handleApplyFromMenu}
          onCancel={handleContentHintMenuClose}
          onMenuMouseEnter={handleMenuMouseEnter}
          onMenuMouseLeave={handleMenuMouseLeave}
          handleClose={handleClickAwayMenu}
        />
        {isViewingScreenShare && (
          <PopupDialog
            isOpen={isModalOpen}
            handleClose={handlePopupDialogClose}
            handleActionClick={handlePopupDialogActionClick}
            actionText={actionText}
          />
        )}
      </>
    )
  );
};

export default ScreenSharingButton;
