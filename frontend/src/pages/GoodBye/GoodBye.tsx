import { useLocation } from 'react-router-dom';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const width = window.innerWidth < 800 ? '100%' : '800px';
  const location = useLocation();
  const roomName = useRoomName({
    useLocationState: true,
  });
  const archives = useArchives({ roomName });
  const header: string = location.state?.header || t('goodbye.default.header');
  const caption: string = location.state?.caption || t('goodbye.default.message');

  return (
    <div className="flex size-full flex-col items-center justify-between bg-white">
      <Banner />
      <div className="h-full">
        <div
          className="flex h-full w-[800px] flex-col content-center items-center md:flex-row md:justify-center"
          style={{
            width: `${width}`,
          }}
        >
          <div className="max-w-[400px]">
            <GoodByeMessage header={header} message={caption} roomName={roomName} />
          </div>
          <div className="h-auto w-full shrink py-4 ps-12 text-left">
            <h3 className="w-9/12 pb-5 text-4xl text-black">{t('archiveList.label')}</h3>
            <ArchiveList archives={archives} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodBye;
