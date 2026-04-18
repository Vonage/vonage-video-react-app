import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Archive } from '../api/archiving/model';
import useArchives from './useArchives';
import useRoomName from './useRoomName';

type UseGoodByePageResult = {
  roomName: string;
  archives: Archive[] | undefined;
  archivesError: Error | null;
  isLoadingArchives: boolean;
  refetchArchives: () => void;
  header: string;
  caption: string;
  isSelfDeclinedRecording: boolean;
};

const useGoodByePage = (): UseGoodByePageResult => {
  const { t } = useTranslation();
  const location = useLocation();

  const roomName = useRoomName({
    useLocationState: true,
  });

  const {
    data: archives,
    error: archivesQueryError,
    isLoading: isLoadingArchives,
    refetch: refetchArchives,
  } = useArchives({ roomName });

  const archivesError = archivesQueryError instanceof Error ? archivesQueryError : null;

  const header: string = location.state?.header || t('goodbye.default.header');
  const caption: string = location.state?.caption || t('goodbye.default.message');
  const isSelfDeclinedRecording: boolean = location.state?.isSelfDeclinedRecording || false;

  return {
    roomName,
    archives,
    archivesError,
    isLoadingArchives,
    refetchArchives,
    header,
    caption,
    isSelfDeclinedRecording,
  };
};

export default useGoodByePage;
