import { ReactElement } from 'react';
import useDateTime from '../../../hooks/useDateTime';
import useRoomName from '../../../hooks/useRoomName';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

/**
 *  TimeRoomName Component
 *
 *  This component shows the current time and room name for desktop-sized viewports.
 * @returns {ReactElement | false} - The Time and Room Name component or false.
 */
const TimeRoomName = (): ReactElement | false => {
  const { time } = useDateTime();
  const roomName = useRoomName();
  const isSmallViewport = useIsSmallViewport();

  return (
    !isSmallViewport && (
      <div
        className="ml-3 mt-1 truncate pr-2 font-normal text-white"
        style={{
          flex: '1 0 0%',
        }}
      >
        {time} | {roomName}
      </div>
    )
  );
};

export default TimeRoomName;
