import type { Dispatch, ReactElement, SetStateAction } from 'react';
import ArchivingButton from '../ArchivingButton';
import CaptionsButton from '../CaptionsButton';
import EmojiGridButton from '../EmojiGridButton';
import ParticipantListButton from '../ParticipantListButton';
import ChatButton from '../ChatButton';
import ReportIssueButton from '../ReportIssueButton';
import LayoutButton from '../LayoutButton';
import useSessionContext from '../../../hooks/useSessionContext';
import ScreenSharingButton from '../../ScreenSharingButton';
import getOverflowMenuButtons from '../../../utils/getOverflowMenuButtons';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Portal from '@mui/material/Portal';
import AdvancedSettingsButton from '../AdvancedSettingsButton';
import getToolbarButtonVisibility from '../Toolbar/helpers/getToolbarButtonVisibility';
import isDisplayableToolbarButton from '../Toolbar/helpers/isDisplayableToolbarButton';

export const testIds = {
  menu: 'toolbar-overflow-menu',
} as const;

export type CaptionsState = {
  isUserCaptionsEnabled: boolean;
  setIsUserCaptionsEnabled: Dispatch<SetStateAction<boolean>>;
  setCaptionsErrorResponse: Dispatch<SetStateAction<string | null>>;
};

export type ToolbarOverflowMenuProps = {
  isOpen: boolean;
  isEmojiGridOpen: boolean;
  setIsEmojiGridOpen: Dispatch<SetStateAction<boolean>>;
  closeMenu: () => void;
  toggleShareScreen: () => void;
  isSharingScreen: boolean;
  toolbarButtonsCount: number;
  captionsState: CaptionsState;
};

/**
 * ToolbarOverflowMenu Component
 *
 * Displays a menu holding buttons that cannot be displayed on the toolbar due to a narrow device viewport width.
 * @param {ToolbarOverflowMenuProps} props - the props for the component
 *  @property {boolean} isOpen - whether the component will be open
 *  @property {boolean} isEmojiGridOpen - whether the emoji grid will be open
 *  @property {Dispatch<SetStateAction<boolean>>} setIsEmojiGridOpen - toggle whether the emoji grid is shown or hidden
 *  @property {() => void} closeMenu - hides the menu when user clicks away from the menu
 *  @property {Function} toggleShareScreen - toggles the user's screenshare
 *  @property {boolean} isSharingScreen - whether the user is sharing their screen
 *  @property {number} toolbarButtonsCount - number of buttons displayed on the toolbar
 *  @property {CaptionsState} captionsState - the state of the captions, including whether they are enabled and functions to set error messages
 * @returns {ReactElement} - The ToolbarOverflowMenu component.
 */
const ToolbarOverflowMenu = ({
  isOpen,
  isEmojiGridOpen,
  setIsEmojiGridOpen,
  closeMenu,
  toggleShareScreen,
  isSharingScreen,
  toolbarButtonsCount,
  captionsState,
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
  const isPinningPresent = subscriberWrappers.some((subWrapper) => subWrapper.isPinned);
  const buttonVisibility = getToolbarButtonVisibility();

  const closeMenuWrapper = (onClick?: () => void) => () => {
    if (onClick) {
      onClick();
    }
    closeMenu();
  };

  // An array of buttons available for the overflow menu. As the screen resizes, buttons may be hidden and moved to the
  // Toolbar to ensure a responsive layout without compromising usability.
  const overflowButtonArray: ReactElement[] = [
    buttonVisibility.screenShare && (
      <ScreenSharingButton
        toggleScreenShare={toggleShareScreen}
        isSharingScreen={isSharingScreen}
        isViewingScreenShare={isViewingScreenShare}
        isOverflowButton
        key="ScreenSharingButton"
      />
    ),
    <LayoutButton
      isScreenSharePresent={isViewingScreenShare}
      isPinningPresent={isPinningPresent}
      isOverflowButton
      onLayoutModeChange={closeMenu}
      key="LayoutButton"
    />,
    buttonVisibility.emojis && (
      <EmojiGridButton
        isEmojiGridOpen={isEmojiGridOpen}
        setIsEmojiGridOpen={setIsEmojiGridOpen}
        isParentOpen={isOpen}
        isOverflowButton
        key="EmojiGridButton"
      />
    ),
    buttonVisibility.captions && (
      <CaptionsButton
        isOverflowButton
        handleClick={closeMenu}
        key="CaptionsButton"
        captionsState={captionsState}
      />
    ),
    buttonVisibility.archiving && (
      <ArchivingButton isOverflowButton handleClick={closeMenu} key="ArchivingButton" />
    ),
    buttonVisibility.advancedSettings && (
      <AdvancedSettingsButton isOverflowButton key="AdvancedSettingsButton" />
    ),
    buttonVisibility.reportIssue && (
      <ReportIssueButton
        isOpen={rightPanelActiveTab === 'issues'}
        handleClick={closeMenuWrapper(toggleReportIssue)}
        isOverflowButton
        key="ReportIssueButton"
      />
    ),
    buttonVisibility.participantList && (
      <ParticipantListButton
        isOpen={rightPanelActiveTab === 'participant-list'}
        handleClick={closeMenuWrapper(toggleParticipantList)}
        participantCount={participantCount}
        isOverflowButton
        key="ParticipantListButton"
      />
    ),
    buttonVisibility.chat && (
      <ChatButton
        isOpen={rightPanelActiveTab === 'chat'}
        handleClick={closeMenuWrapper(toggleChat)}
        isOverflowButton
        key="ChatButton"
      />
    ),
  ].filter(isDisplayableToolbarButton);

  return (
    <Portal>
      <ClickAwayListener onClickAway={closeMenu}>
        <Grow in={isOpen}>
          <Box
            data-testid={testIds.menu}
            className="absolute bottom-20 left-[15px] z-1 flex w-[calc(100dvw-30px)] content-between items-center justify-center gap-3 rounded-lg bg-vera-dark-grey-opacity py-2 pr-5 pl-3 text-vera-on-dark-grey"
          >
            {getOverflowMenuButtons(overflowButtonArray, toolbarButtonsCount)}
          </Box>
        </Grow>
      </ClickAwayListener>
    </Portal>
  );
};

export default ToolbarOverflowMenu;
