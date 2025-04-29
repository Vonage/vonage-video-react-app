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
    <div className="h-auto w-full shrink py-4 ps-12 text-left">
      <h2 className="w-9/12 pb-5 text-5xl text-black" data-testid="header-message">
        {header}
      </h2>
      <h3
        className={`pr-12 text-lg text-slate-500 ${isSmallViewport ? 'w-full' : 'w-[400px]'}`}
        data-testid="goodbye-message"
      >
        {message}
      </h3>
      <div className="mt-6 flex flex-row items-center pr-0">
        <ReenterRoomButton handleReenter={handleReenter} roomName={roomName} />

        <GoToLandingPageButton handleLanding={handleLanding} />
      </div>
    </div>
  );
};

export default GoodByeMessage;
