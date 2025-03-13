import { ReactElement, useCallback, useRef, useState } from 'react';
import AudioControlButton from '../AudioControlButton';
import VideoControlButton from '../VideoControlButton';
import ScreenSharingButton from '../../ScreenSharingButton';
import TimeRoomNameMeetingRoom from '../TimeRoomName';
import ExitButton from '../ExitButton';
import useSessionContext from '../../../hooks/useSessionContext';
import LayoutButton from '../LayoutButton';
import ParticipantListButton from '../ParticipantListButton';
import ArchivingButton from '../ArchivingButton';
import ChatButton from '../ChatButton';
import { RightPanelActiveTab } from '../../../hooks/useRightPanel';
import ReportIssueButton from '../ReportIssueButton';
import ToolbarOverflowButton from '../ToolbarOverflowButton';
import EmojiGridButton from '../EmojiGridButton';
import isReportIssueEnabled from '../../../utils/isReportIssueEnabled';
import useToolbarButtons from '../../../hooks/useToolbarButtons';

export type ToolbarProps = {
  toggleShareScreen: () => void;
  isSharingScreen: boolean;
  rightPanelActiveTab: RightPanelActiveTab;
  toggleParticipantList: () => void;
  toggleChat: () => void;
  toggleReportIssue: () => void;
  participantCount: number;
};

/**
 * Toolbar Component
 *
 * This component returns the UI for the toolbar that is displayed on the bottom of the meeting room.
 * It displays the following items:
 * - The current time and meeting room name
 * - The microphone state with the ability to toggle it on/off and open a drop-down with some audio settings
 * - The video state with the ability to toggle it on/off and open a dropdown with some video settings
 * - Screensharing button (only on desktop devices)
 * - Button to toggle current layout (grid or active speaker)
 * - Button to express yourself (emojis)
 * - Button to open a pop-up to start meeting recording (archiving)
 * - Button containing hidden toolbar items when the viewport is narrow
 * - Button to exit a meeting (redirects to the goodbye page)
 * @param {ToolbarProps} props - the props for the component
 *  @property {() => void} toggleScreenShare - the prop to toggle the screen share on and off
 *  @property {boolean} isSharingScreen - the prop to check if the user is currently sharing a screen
 *  @property {boolean} isParticipantListOpen - the prop to check if the participant list is open
 *  @property {() => void} openParticipantList - the prop to open the participant list
 *  @property {number} participantCount - the prop that holds the current number of participants
 * @returns {ReactElement} - the toolbar component
 */
const Toolbar = ({
  isSharingScreen,
  toggleShareScreen,
  rightPanelActiveTab,
  toggleParticipantList,
  toggleChat,
  toggleReportIssue,
  participantCount,
}: ToolbarProps): ReactElement => {
  const { disconnect, subscriberWrappers } = useSessionContext();
  const isViewingScreenShare = subscriberWrappers.some((subWrapper) => subWrapper.isScreenshare);
  const isScreenSharePresent = isViewingScreenShare || isSharingScreen;
  const isPinningPresent = subscriberWrappers.some((subWrapper) => subWrapper.isPinned);
  const handleLeave = useCallback(() => {
    if (!disconnect) {
      return;
    }
    disconnect();
  }, [disconnect]);
  const [openEmojiGridDesktop, setOpenEmojiGridDesktop] = useState<boolean>(false);

  // An array of buttons available for the toolbar. As the toolbar resizes, buttons may be hidden and moved to the
  // ToolbarOverflowMenu to ensure a responsive layout without compromising usability.
  const toolbarButtons: Array<ReactElement | false> = [
    <ScreenSharingButton
      toggleScreenShare={toggleShareScreen}
      isSharingScreen={isSharingScreen}
      isViewingScreenShare={isViewingScreenShare}
      key="ScreenSharingButton"
    />,
    <LayoutButton
      isScreenSharePresent={isScreenSharePresent}
      key="LayoutButton"
      isPinningPresent={isPinningPresent}
    />,
    <EmojiGridButton
      isEmojiGridOpen={openEmojiGridDesktop}
      setIsEmojiGridOpen={setOpenEmojiGridDesktop}
      isParentOpen
      key="EmojiGridButton"
    />,
    <ArchivingButton key="ArchivingButton" />,
    isReportIssueEnabled() && (
      <ReportIssueButton
        isOpen={rightPanelActiveTab === 'issues'}
        handleClick={toggleReportIssue}
        key="ReportIssueButton"
      />
    ),
    <ParticipantListButton
      isOpen={rightPanelActiveTab === 'participant-list'}
      handleClick={toggleParticipantList}
      participantCount={participantCount}
      key="ParticipantListButton"
    />,
    <ChatButton
      isOpen={rightPanelActiveTab === 'chat'}
      handleClick={toggleChat}
      key="ChatButton"
    />,
  ];
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const timeRoomNameRef = useRef<HTMLDivElement | null>(null);
  const mediaControlsRef = useRef<HTMLDivElement | null>(null);
  const rightPanelControlsRef = useRef<HTMLDivElement | null>(null);
  const overflowAndExitRef = useRef<HTMLDivElement | null>(null);

  const { displayTimeRoomName, centerButtonLimit, rightButtonLimit } = useToolbarButtons({
    timeRoomNameRef,
    toolbarRef,
    mediaControlsRef,
    overflowAndExitRef,
    rightPanelControlsRef,
    numberOfToolbarButtons: toolbarButtons.length,
  });

  const toolbarButtonsDisplayed = rightButtonLimit;
  const shouldShowOverflowButton = toolbarButtonsDisplayed < toolbarButtons.length;
  const displayCenterToolbarButtons = (toolbarButton: ReactElement | false, index: number) =>
    index < centerButtonLimit && toolbarButton;
  const displayRightPanelButtons = (toolbarButton: ReactElement | false, index: number) =>
    index >= centerButtonLimit && index < rightButtonLimit && toolbarButton;

  return (
    <div
      ref={toolbarRef}
      className="absolute bottom-0 left-0 flex h-[80px] w-full items-center bg-darkGray-100 p-4 md:flex-row md:justify-between"
    >
      <div
        ref={timeRoomNameRef}
        className={`${toolbarButtonsDisplayed <= 1 ? '' : 'mr-3'} flex justify-start overflow-hidden`}
      >
        {displayTimeRoomName && <TimeRoomNameMeetingRoom />}
      </div>
      <div className="flex flex-1 justify-center">
        <div ref={mediaControlsRef} className="flex flex-row">
          <AudioControlButton />
          <VideoControlButton />
        </div>
        {toolbarButtons.map(displayCenterToolbarButtons)}
        <div ref={overflowAndExitRef} className="flex min-w-[108px] flex-row">
          {shouldShowOverflowButton && (
            <ToolbarOverflowButton
              isSharingScreen={isSharingScreen}
              toggleShareScreen={toggleShareScreen}
              toolbarButtonsCount={toolbarButtonsDisplayed}
            />
          )}
          <ExitButton handleLeave={handleLeave} />
        </div>
      </div>

      <div
        className={toolbarButtonsDisplayed <= 1 ? '' : 'ml-3'}
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flex: '0 1 0%',
          justifyContent: 'flex-end',
        }}
        ref={rightPanelControlsRef}
      >
        {toolbarButtons.map(displayRightPanelButtons)}
      </div>
    </div>
  );
};

export default Toolbar;
