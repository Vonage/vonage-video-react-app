import { useLocation, useNavigate } from 'react-router-dom';
import { ReactElement } from 'react';
import { Button } from '@mui/material';
import useRoomName from '../../hooks/useRoomName';
import ReenterRoomButton from '../../components/GoodBye/ReenterRoomButton';
import useIsSmallViewport from '../../hooks/useIsSmallViewport';

/**
 * GoodBye Component
 *
 * This component displays a goodbye message when a user leaves the meeting room.
 * It shows a banner, a set of salutations, and two buttons:
 * - One to re-enter the room
 * - One to go back to the landing page
 * It also shows a list of archives available for download (if applicable).
 * @returns {ReactElement} - the goodbye page.
 */
const GoodBye = (): ReactElement => {
  const navigate = useNavigate();
  const isSmallViewport = useIsSmallViewport();
  const width = window.innerWidth < 800 ? '100%' : '800px';
  const location = useLocation();
  const roomName = useRoomName({
    useLocationState: true,
  });
  const header: string = location.state?.header || 'You left the room';
  const caption: string = location.state?.caption || 'We hope you had fun';

  return (
    <div className="flex size-full flex-col items-center justify-between bg-white">
      <div className="h-full">
        <div
          className="flex h-full w-[800px] flex-col content-center items-center md:flex-row md:justify-center"
          style={{
            width: `${width}`,
          }}
        >
          <div className="max-w-[400px]">
            <div className="h-auto w-full shrink py-4 ps-12 text-left">
              <h2 className="w-9/12 pb-5 text-5xl text-black" data-testid="header-message">
                {header}
              </h2>
              <h3
                className={`pr-12 text-lg text-slate-500 ${isSmallViewport ? 'w-full' : 'w-[400px]'}`}
                data-testid="goodbye-message"
              >
                {caption}
              </h3>
              <div className="mt-6 flex flex-row items-center pr-0">
                <ReenterRoomButton
                  handleReenter={() => navigate(`/room/${roomName}`)}
                  roomName={roomName}
                />

                <Button
                  data-testid="go-to-landing-button"
                  variant="contained"
                  className="h-12"
                  sx={{ textTransform: 'none', fontSize: '1rem', marginBottom: '16px' }}
                  onClick={() => window.close()}
                >
                  Close this window
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodBye;
