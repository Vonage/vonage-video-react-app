import type { ReactElement } from 'react';
import MeetingRoomBackdrop from '../components/MeetingRoomBackdrop';
import TimeRoomLabel from '../components/TimeRoomLabel';
import meetingExtension$ from '../context/meetingExtensionContext';
import ExtensionTimerButton from './ExtensionTimerPopover/ExtensionTimerButton';
import ExtensionTimerPopover from './ExtensionTimerPopover/ExtensionTimerPopover';

/**
 * Variant C in the meeting room: timer button in the toolbar, popover above it.
 */
const MeetingRoomWithTimer = (): ReactElement => {
  const isOpen = meetingExtension$.use.select((state) => state.isOpen);

  return (
    <MeetingRoomBackdrop>
      <MeetingRoomBackdrop.ToolbarStart>
        <TimeRoomLabel />
      </MeetingRoomBackdrop.ToolbarStart>
      <MeetingRoomBackdrop.ToolbarEnd>
        <ExtensionTimerButton />
      </MeetingRoomBackdrop.ToolbarEnd>
      <MeetingRoomBackdrop.Overlay>
        {isOpen && <ExtensionTimerPopover />}
      </MeetingRoomBackdrop.Overlay>
    </MeetingRoomBackdrop>
  );
};

export default MeetingRoomWithTimer;
