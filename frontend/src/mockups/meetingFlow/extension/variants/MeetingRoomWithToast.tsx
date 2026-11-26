import type { ReactElement } from 'react';
import ToolbarButton from '@components/MeetingRoom/ToolbarButton';
import VividIcon from '@ui/components/VividIcon';
import MeetingRoomBackdrop from '../components/MeetingRoomBackdrop';
import TimeRoomLabel from '../components/TimeRoomLabel';
import meetingExtension$ from '../context/meetingExtensionContext';
import ExtensionOverflowMenu from './ExtensionToast/ExtensionOverflowMenu';
import ExtensionToast from './ExtensionToast/ExtensionToast';

/**
 * Variant A in the meeting room. `isMenuOpen` shows the overflow-menu entry used to extend at any time.
 */
const MeetingRoomWithToast = ({ isMenuOpen }: { isMenuOpen: boolean }): ReactElement => {
  const isOpen = meetingExtension$.use.select((state) => state.isOpen);

  return (
    <MeetingRoomBackdrop>
      <MeetingRoomBackdrop.ToolbarStart>
        <TimeRoomLabel />
      </MeetingRoomBackdrop.ToolbarStart>
      <MeetingRoomBackdrop.ToolbarEnd>
        <ToolbarButton
          aria-hidden
          tabIndex={-1}
          className={isMenuOpen ? 'bg-vera-primary!' : undefined}
          icon={
            <VividIcon
              name="more-vertical-solid"
              customSize={-4}
              style={{ color: 'var(--vera-on-dark-grey)' }}
            />
          }
        />
      </MeetingRoomBackdrop.ToolbarEnd>
      <MeetingRoomBackdrop.Overlay>
        {isMenuOpen && !isOpen && <ExtensionOverflowMenu />}
        {isOpen && <ExtensionToast />}
      </MeetingRoomBackdrop.Overlay>
    </MeetingRoomBackdrop>
  );
};

export default MeetingRoomWithToast;
