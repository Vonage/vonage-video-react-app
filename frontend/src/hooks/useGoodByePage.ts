import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Archive } from '../api/archiving/model';
import useArchives from './useArchives';
import useRoomName from './useRoomName';

type UseGoodByePageResult = {
  roomName: string;
  archives: Archive[] | 'error';
  header: string;
  caption: string;
};

const useGoodByePage = (): UseGoodByePageResult => {
  const { t } = useTranslation();
  const location = useLocation();

  const roomName = useRoomName({
    useLocationState: true,
  });

  const archives = useArchives({ roomName });

  const header: string = location.state?.header || t('goodbye.default.header');
  const caption: string = location.state?.caption || t('goodbye.default.message');

  return {
    roomName,
    archives,
    header,
    caption,
  };
};

export default useGoodByePage;
