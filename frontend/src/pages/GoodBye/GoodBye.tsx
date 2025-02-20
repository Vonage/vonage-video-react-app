import { useLocation } from 'react-router-dom';
import { ReactElement } from 'react';
import Banner from '../../components/Banner';
import useArchives from '../../hooks/useArchives';
import ArchiveList from '../../components/GoodBye/ArchiveList';
import GoodByeMessage from '../../components/GoodBye/GoodbyeMessage';
import useRoomName from '../../hooks/useRoomName';

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
  const width = window.innerWidth < 800 ? '100%' : '800px';
  const location = useLocation();
  const roomName = useRoomName({
    useLocationState: true,
  });
  const archives = useArchives({ roomName });
  const header: string = location.state?.header || 'You left the room';
  const caption: string = location.state?.caption || 'We hope you had fun';

  return (
    <div className="bg-white flex h-full w-full justify-between flex-col items-center">
      <Banner />
      <div className="h-full">
        <div
          className="flex w-[800px] h-full items-center content-center md:justify-center flex-col md:flex-row items-start"
          style={{
            width: `${width}`,
          }}
        >
          <div className="max-w-[400px]">
            <GoodByeMessage header={header} message={caption} roomName={roomName} />
          </div>
          <div className="ps-12 py-4 h-auto shrink w-full text-left">
            <h3 className="text-4xl text-black pb-5 w-9/12">Recordings</h3>
            <ArchiveList archives={archives} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodBye;
