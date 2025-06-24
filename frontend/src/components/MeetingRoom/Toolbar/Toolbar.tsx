import { Dispatch, ReactElement, SetStateAction, useCallback, useRef, useState } from 'react';
import ScreenSharingButton from '../../ScreenSharingButton';
import TimeRoomNameMeetingRoom from '../TimeRoomName';
import ExitButton from '../ExitButton';
import useSessionContext from '../../../hooks/useSessionContext';
import LayoutButton from '../LayoutButton';
import ParticipantListButton from '../ParticipantListButton';
import ArchivingButton from '../ArchivingButton';
import CaptionsButton from '../CaptionsButton';
import ChatButton from '../ChatButton';
import { RightPanelActiveTab } from '../../../hooks/useRightPanel';
import ReportIssueButton from '../ReportIssueButton';
import ToolbarOverflowButton from '../ToolbarOverflowButton';
import EmojiGridButton from '../EmojiGridButton';
import isReportIssueEnabled from '../../../utils/isReportIssueEnabled';
import useToolbarButtons from '../../../hooks/useToolbarButtons';
import DeviceControlButton from '../DeviceControlButton';

export type CaptionsState = {
  isUserCaptionsEnabled: boolean;
  setIsUserCaptionsEnabled: Dispatch<SetStateAction<boolean>>;
  setCaptionsErrorResponse: Dispatch<SetStateAction<string | null>>;
};

export type ToolbarProps = {
  toggleShareScreen: () => void;
  isSharingScreen: boolean;
  rightPanelActiveTab: RightPanelActiveTab;
  toggleParticipantList: () => void;
  toggleChat: () => void;
  toggleReportIssue: () => void;
  participantCount: number;
  captionsState: CaptionsState;
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
 * - Button to toggle captions on and off
 * - Button to open a pop-up to start meeting recording (archiving)
 * - Button containing hidden toolbar items when the viewport is narrow
 * - Button to exit a meeting (redirects to the goodbye page)
 * @param {ToolbarProps} props - the props for the component
 *  @property {() => void} toggleScreenShare - the prop to toggle the screen share on and off
 *  @property {boolean} isSharingScreen - the prop to check if the user is currently sharing a screen
 *  @property {boolean} isParticipantListOpen - the prop to check if the participant list is open
 *  @property {() => void} openParticipantList - the prop to open the participant list
 *  @property {CaptionsState} captionsState - the state of the captions, including whether they are enabled and a function to set an error message
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
  captionsState,
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
    <CaptionsButton key="CaptionsButton" captionsState={captionsState} />,
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
  // We track the toolbar and the accompanying containers so we know which toolbar buttons to display, and whether the TimeRoomName should be displayed
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
  // We display the overflow button when we don't have enough space to display all the toolbar buttons
  const shouldShowOverflowButton = toolbarButtonsDisplayed < toolbarButtons.length;
  const displayCenterToolbarButtons = (toolbarButton: ReactElement | false, index: number) =>
    index < centerButtonLimit && toolbarButton;
  // Displays the right panel buttons - any additional buttons to be displayed that aren't in the center of the toolbar.
  const displayRightPanelButtons = (toolbarButton: ReactElement | false, index: number) =>
    index >= centerButtonLimit && index < rightButtonLimit && toolbarButton;
  // Array of `false` or right panel button ReactElements to display.
  const rightPanelButtons = toolbarButtons.map(displayRightPanelButtons);
  // We display the right panel if we have at least one right panel button to display.
  const displayRightPanel = rightPanelButtons.some((rightPanelButton) => !!rightPanelButton);
  // We hide the TimeRoomName container when there is no space, and remove its margin when we don't display the right panel container.
  const displayTimeRoomNameClass = `${!displayRightPanel ? 'mr-3 ' : ''}${!displayTimeRoomName ? 'hidden ' : ''}flex flex-1 justify-start overflow-hidden`;
  // We hide the right panel buttons container when there are no buttons to display, and grow/shrink it when we display the TimeRoomName container.
  const rightPanelButtonsClass = `${!displayRightPanel ? 'hidden ' : ''}${displayTimeRoomName ? 'flex-1 ' : ''}ml-3 box-border flex justify-end`;

  return (
    <div
      ref={toolbarRef}
      className="absolute bottom-0 left-0 flex h-[80px] w-full flex-row items-center justify-between bg-darkGray-100 p-4"
    >
      <div ref={timeRoomNameRef} className={displayTimeRoomNameClass}>
        {displayTimeRoomName && <TimeRoomNameMeetingRoom />}
      </div>
      <div className="flex flex-1 justify-center">
        <div ref={mediaControlsRef} className="flex flex-row">
          <DeviceControlButton deviceType="audio" />
          <DeviceControlButton deviceType="video" />
        </div>
        {toolbarButtons.map(displayCenterToolbarButtons)}
        <div ref={overflowAndExitRef} className="flex flex-row">
          {shouldShowOverflowButton && (
            <ToolbarOverflowButton
              isSharingScreen={isSharingScreen}
              toggleShareScreen={toggleShareScreen}
              toolbarButtonsCount={toolbarButtonsDisplayed}
              captionsState={captionsState}
            />
          )}
          <ExitButton handleLeave={handleLeave} />
        </div>
      </div>

      <div className={rightPanelButtonsClass} ref={rightPanelControlsRef}>
        {rightPanelButtons}
      </div>
    </div>
  );
};

export default Toolbar;
