import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArchiveResponse, getArchives } from '../api/archiving';
import { Archive } from '../api/archiving/model';

export type UseArchivesProps = {
  roomName: string;
};

/**
 * Returns the archives from a session, or `error` if there is an error.
 * @param { UseArchivesProps} props - The props for the hook.
 * @returns {Archive[] | 'error'} An array of Archives, or the text, `error`.
 */
const useArchives = ({ roomName }: UseArchivesProps): Archive[] | 'error' => {
  const { i18n } = useTranslation();
  const [archives, setArchives] = useState<Archive[] | 'error'>([]);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    const fetchArchives = async () => {
      if (roomName) {
        let archiveData: ArchiveResponse;
        try {
          archiveData = await getArchives(i18n.language, roomName);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : error;
          console.error(`Error retrieving archive: ${message}`);
          setArchives('error');
          return;
        }
        // If we have archives not yet available for download we poll the API every 5s to see if its' available.
        if (archiveData.hasPending && pollingIntervalRef.current === undefined) {
          pollingIntervalRef.current = setInterval(() => {
            fetchArchives();
          }, 5000);
        } else if (!archiveData.hasPending && pollingIntervalRef.current !== undefined) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = undefined;
        }
        setArchives(archiveData.archives);
      }
    };
    fetchArchives();
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [roomName, i18n.language]);
  return archives;
};

export default useArchives;
