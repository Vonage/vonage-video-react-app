import { useNavigate } from 'react-router-dom';
import { ReactElement } from 'react';
import GoToLandingPageButton from '../GoToLandingPageButton';
import ReenterRoomButton from '../ReenterRoomButton';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type GoodByeMessageProps = {
  header: string;
  message: string;
  roomName: string;
};

/**
 * GoodByeMessage Component
 * Displays a goodbye message to the user along with two navigation buttons - one to the previously left room, and another for the landing page.
 * @param {GoodByeMessageProps} props - The props for the component.
 * @returns {ReactElement} The GoodByeMessage component.
 */
const GoodByeMessage = ({ header, message, roomName }: GoodByeMessageProps): ReactElement => {
  const isSmallViewport = useIsSmallViewport();
  const navigate = useNavigate();
  const handleLanding = () => {
    navigate('/');
  };

  const handleReenter = () => {
    navigate(`/waiting-room/${roomName}`);
  };
  return (
    <div className="ps-12 py-4 h-auto w-full shrink text-left">
      <h2 className="text-5xl text-black pb-5 w-9/12">{header}</h2>
      <h3 className={`text-large text-slate-500 pr-12 ${isSmallViewport ? 'w-full' : 'w-[400px]'}`}>
        {message}
      </h3>
      <div className="flex flex-row mt-6 items-center pr-0">
        <ReenterRoomButton handleReenter={handleReenter} roomName={roomName} />

        <GoToLandingPageButton handleLanding={handleLanding} />
      </div>
    </div>
  );
};

export default GoodByeMessage;
