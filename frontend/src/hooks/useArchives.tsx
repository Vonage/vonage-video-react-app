import useCoreArchives from '@core/archives/hooks/useArchives';
import { useTranslation } from 'react-i18next';

import { getArchives, type ArchiveResponse } from '../api/archiving';
import type { Archive } from '../api/archiving/model';

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

  return useCoreArchives<Archive>({
    getArchives: getFrontendArchives,
    language: i18n.language,
    onError: logArchiveRetrievalError,
    roomName,
  });
};

function getFrontendArchives({
  language,
  roomName,
}: {
  language: string;
  roomName: string;
}): Promise<ArchiveResponse> {
  return getArchives(language, roomName);
}

function logArchiveRetrievalError(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Error retrieving archive: ${message}`);
}

export default useArchives;
