import tryCatch from '@common/execution/tryCatch';
import { useEffect, useRef, useState } from 'react';

export type ArchivesResponse<TArchive> = {
  archives: TArchive[];
  hasPending: boolean;
};

export type GetArchivesArgs = {
  language: string;
  roomName: string;
};

export type UseArchivesProps<TArchive> = {
  getArchives: (args: GetArchivesArgs) => Promise<ArchivesResponse<TArchive>>;
  language: string;
  onError?: (error: unknown) => void;
  pollingIntervalInMilliseconds?: number;
  roomName: string;
};

export type UseArchivesResult<TArchive> = TArchive[] | 'error';

const useArchives = <TArchive>({
  getArchives,
  language,
  onError,
  pollingIntervalInMilliseconds = 5000,
  roomName,
}: UseArchivesProps<TArchive>): UseArchivesResult<TArchive> => {
  const [archives, setArchives] = useState<UseArchivesResult<TArchive>>([]);
  const pollingIntervalReference = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const clearPollingInterval = () => {
      if (pollingIntervalReference.current === null) {
        return;
      }

      clearInterval(pollingIntervalReference.current);
      pollingIntervalReference.current = null;
    };

    const fetchArchives = async () => {
      if (!roomName) {
        clearPollingInterval();
        setArchives([]);
        return;
      }

      const { result: archiveData, error } = await tryCatch(() =>
        getArchives({ language, roomName })
      );

      if (error || archiveData === null) {
        onError?.(error);
        clearPollingInterval();
        setArchives('error');
        return;
      }

      const shouldStartPolling =
        archiveData.hasPending && pollingIntervalReference.current === null;

      if (shouldStartPolling) {
        pollingIntervalReference.current = setInterval(() => {
          void fetchArchives();
        }, pollingIntervalInMilliseconds);
      }

      if (!archiveData.hasPending) {
        clearPollingInterval();
      }

      setArchives(archiveData.archives);
    };

    void fetchArchives();

    return clearPollingInterval;
  }, [getArchives, language, onError, pollingIntervalInMilliseconds, roomName]);

  return archives;
};

export default useArchives;
