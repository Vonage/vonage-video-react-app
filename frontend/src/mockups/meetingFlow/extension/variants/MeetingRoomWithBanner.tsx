import type { ReactElement } from 'react';
import MeetingRoomBackdrop from '../components/MeetingRoomBackdrop';
import meetingExtension$ from '../context/meetingExtensionContext';
import ExtensionBanner from './ExtensionBanner/ExtensionBanner';
import ExtensionEndPill from './ExtensionBanner/ExtensionEndPill';

/**
 * Variant B in the meeting room: end-time pill in the toolbar, banner at the top of the canvas.
 */
const MeetingRoomWithBanner = (): ReactElement => {
  const isOpen = meetingExtension$.use.select((state) => state.isOpen);

  return (
    <MeetingRoomBackdrop>
      <MeetingRoomBackdrop.ToolbarStart>
        <ExtensionEndPill />
      </MeetingRoomBackdrop.ToolbarStart>
      <MeetingRoomBackdrop.Overlay>{isOpen && <ExtensionBanner />}</MeetingRoomBackdrop.Overlay>
    </MeetingRoomBackdrop>
  );
};

export default MeetingRoomWithBanner;
