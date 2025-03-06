import { ClickAwayListener, Portal } from '@mui/base';
import { Box, Grow } from '@mui/material';
import { Dispatch, ReactElement, SetStateAction } from 'react';
import ArchivingButton from '../ArchivingButton';
import EmojiGridButton from '../EmojiGridButton';
import ParticipantListButton from '../ParticipantListButton';
import ChatButton from '../ChatButton';
import ReportIssueButton from '../ReportIssueButton';
import LayoutButton from '../LayoutButton';
import useSessionContext from '../../../hooks/useSessionContext';
import ScreenSharingButton from '../../ScreenSharingButton';
import useShownButtons from '../../../hooks/useShownButtons';

export type ToolbarOverflowMenuProps = {
  isOpen: boolean;
  isEmojiGridOpen: boolean;
  setIsEmojiGridOpen: Dispatch<SetStateAction<boolean>>;
  closeMenu: (event?: MouseEvent | TouchEvent) => void;
  toggleShareScreen: () => void;
  isSharingScreen: boolean;
};

/**
 * ToolbarOverflowMenu Component
 *
 * Displays a menu holding buttons that cannot be displayed on the toolbar due to a narrow device viewport width.
 * @param {ToolbarOverflowMenuProps} props - the props for the component
 *  @property {boolean} isOpen - whether the component will be open
 *  @property {boolean} isEmojiGridOpen - whether the emoji grid will be open
 *  @property {Dispatch<SetStateAction<boolean>>} setIsEmojiGridOpen - toggle whether the emoji grid is shown or hidden
 *  @property {(event: MouseEvent | TouchEvent) => void} closeMenu - hides the menu when user clicks away from the menu
 *  @property {Function} toggleShareScreen - toggles the user's screenshare
 *  @property {boolean} isSharingScreen - whether the user is sharing their screen
 * @returns {ReactElement} - The ToolbarOverflowMenu component.
 */
const ToolbarOverflowMenu = ({
  isOpen,
  isEmojiGridOpen,
  setIsEmojiGridOpen,
  closeMenu,
  toggleShareScreen,
  isSharingScreen,
}: ToolbarOverflowMenuProps): ReactElement => {
  const {
    subscriberWrappers,
    rightPanelActiveTab,
    toggleParticipantList,
    toggleChat,
    toggleReportIssue,
  } = useSessionContext();
  const isViewingScreenShare = subscriberWrappers.some((subWrapper) => subWrapper.isScreenshare);
  const participantCount =
    subscriberWrappers.filter(({ isScreenshare }) => !isScreenshare).length + 1;
  const isReportIssueEnabled = import.meta.env.VITE_ENABLE_REPORT_ISSUE === 'true';

  const closeMenuWrapper = (onClick?: () => void) => () => {
    if (onClick) {
      onClick();
    }
    closeMenu();
  };

  const shownButtons = useShownButtons();
  const mobileButtonArray = [
    <ScreenSharingButton
      toggleScreenShare={toggleShareScreen}
      isSharingScreen={isSharingScreen}
      isViewingScreenShare={isViewingScreenShare}
      isOverflowButton
      key="ScreenSharingButton"
    />,
    <LayoutButton
      isScreenSharePresent={isViewingScreenShare}
      isOverflowButton
      key="LayoutButton"
    />,
    <EmojiGridButton
      isEmojiGridOpen={isEmojiGridOpen}
      setIsEmojiGridOpen={setIsEmojiGridOpen}
      isParentOpen={isOpen}
      isOverflowButton
      key="EmojiGridButton"
    />,
    <ArchivingButton isOverflowButton handleClick={closeMenu} key="ArchivingButton" />,
    isReportIssueEnabled && (
      <ReportIssueButton
        isOpen={rightPanelActiveTab === 'issues'}
        handleClick={closeMenuWrapper(toggleReportIssue)}
        isOverflowButton
        key="ReportIssueButton"
      />
    ),
    <ParticipantListButton
      isOpen={rightPanelActiveTab === 'participant-list'}
      handleClick={closeMenuWrapper(toggleParticipantList)}
      participantCount={participantCount}
      isOverflowButton
      key="ParticipantListButton"
    />,
    <ChatButton
      isOpen={rightPanelActiveTab === 'chat'}
      handleClick={closeMenuWrapper(toggleChat)}
      isOverflowButton
      key="ChatButton"
    />,
  ];

  return (
    <Portal>
      <ClickAwayListener onClickAway={closeMenu}>
        <Grow in={isOpen}>
          <Box
            data-testid="toolbar-overflow-menu"
            sx={{
              backgroundColor: '#272c2f',
              color: '#fff',
              padding: { xs: 1 },
              borderRadius: 2,
              zIndex: 1,
              width: 'calc(100dvw - 30px)',
              display: 'flex',
              justifyContent: 'center',
              alignContent: 'space-between',
              alignItems: 'center',
              paddingLeft: '12px',
              position: 'absolute',
              left: '15px',
              bottom: '80px',
            }}
          >
            {mobileButtonArray.map((mobileButton, index) =>
              shownButtons <= index ? mobileButton : null
            )}
          </Box>
        </Grow>
      </ClickAwayListener>
    </Portal>
  );
};

export default ToolbarOverflowMenu;
