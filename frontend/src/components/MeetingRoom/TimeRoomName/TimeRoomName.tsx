import { ReactElement, useRef } from 'react';
import { useMountEffect, useStableRef } from '@web/hooks';
import { useTranslation } from 'react-i18next';
import { getFormattedTime } from '@utils/dateTime';
import useSessionContext from '@hooks/useSessionContext';

/**
 *  TimeRoomName Component
 *
 *  This component shows the current time and room name.
 * @returns {ReactElement} - The Time and Room Name component.
 */
const TimeRoomName = (): ReactElement => {
  const { i18n } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const { sessionDetails } = useSessionContext();
  const roomNameRef = useStableRef(sessionDetails?.roomName);

  useMountEffect(() => {
    const intervalId = setInterval(() => {
      const time = getFormattedTime(i18n.language);

      ref.current!.textContent = `${time} | ${roomNameRef?.current}`;
    }, 1_000);

    return () => {
      clearInterval(intervalId);
    };
  });

  return (
    <div
      ref={ref}
      data-testid="time-room-name"
      className="text-vera-accent ml-0.5 mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap"
    >
      {getFormattedTime(i18n.language)} | {roomNameRef.current}
    </div>
  );
};

export default TimeRoomName;
