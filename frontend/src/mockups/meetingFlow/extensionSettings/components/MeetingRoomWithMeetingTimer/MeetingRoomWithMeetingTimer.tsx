import type { PropsWithChildren, ReactElement } from 'react';
import MeetingRoomBackdrop from '../../../extension/components/MeetingRoomBackdrop';
import TimeRoomLabel from '../../../extension/components/TimeRoomLabel';
import useMeetingTabCopy from '../../hooks/useMeetingTabCopy';
import MeetingTimerPill from '../MeetingTimerPill';

/**
 * The meeting room behind the Settings dialog and the popup; the toolbar timer shows in the last five minutes.
 */
const MeetingRoomWithMeetingTimer = ({ children }: PropsWithChildren): ReactElement => {
  const { isEndingSoon } = useMeetingTabCopy();

  return (
    <MeetingRoomBackdrop>
      <MeetingRoomBackdrop.ToolbarStart>
        <TimeRoomLabel />
      </MeetingRoomBackdrop.ToolbarStart>
      <MeetingRoomBackdrop.ToolbarEnd>
        {isEndingSoon && <MeetingTimerPill />}
      </MeetingRoomBackdrop.ToolbarEnd>
      <MeetingRoomBackdrop.Overlay>{children}</MeetingRoomBackdrop.Overlay>
    </MeetingRoomBackdrop>
  );
};

export default MeetingRoomWithMeetingTimer;
