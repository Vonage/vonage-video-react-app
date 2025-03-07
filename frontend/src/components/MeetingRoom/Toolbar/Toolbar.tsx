import { ReactElement, useCallback, useState } from 'react';
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
import useToolbarCount from '../../../hooks/useToolbarCount';
import {
  getCenterToolbarButtons,
  getRightPanelButtons,
} from '../../../utils/getVisibleToolbarButtons';
import { RIGHT_PANEL_BUTTON_COUNT } from '../../../utils/constants';
import isReportIssueEnabled from '../../../utils/isReportIssueEnabled';

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
  const handleLeave = useCallback(() => {
    if (!disconnect) {
      return;
    }
    disconnect();
  }, [disconnect]);
  const [openEmojiGridDesktop, setOpenEmojiGridDesktop] = useState<boolean>(false);
  const toolbarCount = useToolbarCount();

  // An array of buttons available for the toolbar. As the toolbar resizes, buttons may be hidden and moved to the
  // ToolbarOverflowMenu to ensure a responsive layout without compromising usability.
  const toolbarButtons: Array<ReactElement | false> = [
    <ScreenSharingButton
      toggleScreenShare={toggleShareScreen}
      isSharingScreen={isSharingScreen}
      isViewingScreenShare={isViewingScreenShare}
      key="ScreenSharingButton"
    />,
    <LayoutButton isScreenSharePresent={isScreenSharePresent} key="LayoutButton" />,
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
  const isToolbarExpanded = toolbarCount >= toolbarButtons.length;
  const shouldShowOverflowButton = toolbarCount < toolbarButtons.length;
  // If we have no right panel buttons to show in the container, we do not need a margin
  const marginLeft =
    toolbarCount >= toolbarButtons.length - RIGHT_PANEL_BUTTON_COUNT ? '12px' : '0px';

  return (
    <div className="absolute bottom-0 left-0 flex h-[80px] w-full items-center bg-darkGray-100 p-4 md:flex-row md:justify-between">
      <div className="flex justify-start overflow-hidden">
        {isToolbarExpanded && <TimeRoomNameMeetingRoom />}
      </div>
      <div className="flex flex-1 justify-center">
        <AudioControlButton />
        <VideoControlButton />
        {getCenterToolbarButtons(toolbarButtons, toolbarCount)}
        {shouldShowOverflowButton && (
          <ToolbarOverflowButton
            isSharingScreen={isSharingScreen}
            toggleShareScreen={toggleShareScreen}
          />
        )}
        <ExitButton handleLeave={handleLeave} />
      </div>

      <div
        style={{
          boxSizing: 'border-box',
          marginLeft,
          display: 'flex',
          flex: '0 1 0%',
          justifyContent: 'flex-end',
        }}
      >
        {getRightPanelButtons(toolbarButtons, toolbarCount)}
      </div>
    </div>
  );
};

export default Toolbar;
