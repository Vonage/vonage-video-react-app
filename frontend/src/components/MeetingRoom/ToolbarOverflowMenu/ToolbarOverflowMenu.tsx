import { ClickAwayListener, PopperChildrenProps } from '@mui/base';
import { Grow, Paper, Popper } from '@mui/material';
import { Dispatch, ReactElement, RefObject, SetStateAction } from 'react';
import ArchivingButton from '../ArchivingButton';
import EmojiGridButton from '../EmojiGridButton';
import ParticipantListButton from '../ParticipantListButton';
import ChatButton from '../ChatButton';
import ReportIssueButton from '../ReportIssueButton';
import LayoutButton from '../LayoutButton';
import useSessionContext from '../../../hooks/useSessionContext';
import ScreenSharingButton from '../../ScreenSharingButton';

export type ToolbarOverflowMenuProps = {
  isToolbarOverflowMenuOpen: boolean;
  isEmojiGridOpen: boolean;
  setIsEmojiGridOpen: Dispatch<SetStateAction<boolean>>;
  anchorRef: RefObject<HTMLButtonElement | null>;
  handleClickAway: () => void;
  toggleShareScreen: () => void;
  isSharingScreen: boolean;
};

/**
 * ToolbarOverflowMenu Component
 *
 * Displays a menu holding buttons that cannot be displayed on the toolbar due to a narrow device viewport width.
 * @param {ToolbarOverflowMenuProps} props - the props for the component
 *  @property {boolean} isToolbarOverflowMenuOpen - whether the component will be open
 *  @property {boolean} isEmojiGridOpen - whether the emoji grid will be open
 *  @property {Dispatch<SetStateAction<boolean>>} setIsEmojiGridOpen - toggle whether the emoji grid is shown or hidden
 *  @property {RefObject<HTMLButtonElement | null>} anchorRef - the button ref for the menu
 *  @property {() => void} handleClickAway - hides the menu when user clicks away from the menu
 * @returns {ReactElement} - The ToolbarOverflowMenu component.
 */
const ToolbarOverflowMenu = ({
  isToolbarOverflowMenuOpen,
  isEmojiGridOpen,
  setIsEmojiGridOpen,
  anchorRef,
  handleClickAway,
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
  return (
    <Popper
      open={isToolbarOverflowMenuOpen}
      anchorEl={anchorRef.current}
      transition
      disablePortal
      placement="bottom"
    >
      {({ TransitionProps, placement }: PopperChildrenProps) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            width: 'calc(100dvw - 30px)',
            left: '-15px',
            position: 'relative',
            translate: '0px -9px',
          }}
        >
          <div className="flex w-full text-left font-normal">
            <ClickAwayListener onClickAway={handleClickAway}>
              <Paper
                data-testid="toolbar-overflow-menu"
                className="flex items-center justify-center"
                sx={{
                  backgroundColor: '#272c2f',
                  color: '#fff',
                  padding: { xs: 1 },
                  borderRadius: 2,
                  zIndex: 1,
                  width: '100%',
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignContent: 'space-between',
                  alignItems: 'center',
                  paddingLeft: '12px',
                }}
              >
                <ScreenSharingButton
                  toggleScreenShare={toggleShareScreen}
                  isSharingScreen={isSharingScreen}
                  isViewingScreenShare={isViewingScreenShare}
                  isOverflowButton
                />
                <LayoutButton isScreenSharePresent={isViewingScreenShare} isOverflowButton />
                <EmojiGridButton
                  isEmojiGridOpen={isEmojiGridOpen}
                  setIsEmojiGridOpen={setIsEmojiGridOpen}
                  isParentOpen={isToolbarOverflowMenuOpen}
                  isOverflowButton
                />
                <ArchivingButton isOverflowButton />
                {isReportIssueEnabled && (
                  <ReportIssueButton
                    isOpen={rightPanelActiveTab === 'issues'}
                    handleClick={toggleReportIssue}
                    isOverflowButton
                  />
                )}
                <ParticipantListButton
                  isOpen={rightPanelActiveTab === 'participant-list'}
                  handleClick={toggleParticipantList}
                  participantCount={participantCount}
                />
                <ChatButton isOpen={rightPanelActiveTab === 'chat'} handleClick={toggleChat} />
              </Paper>
            </ClickAwayListener>
          </div>
        </Grow>
      )}
    </Popper>
  );
};

export default ToolbarOverflowMenu;
