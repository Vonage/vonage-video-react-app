import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useArchives as useArchivesBase } from '@core/hooks';
import { createArchiveFromServer, ServerArchive } from '../api/archiving/model';
import { SingleArchiveResponse } from '@vonage/video';

export type UseArchivesProps = {
  sessionKey: string | undefined;
};

const pollingIntervalMs = 5000;

/**
 * Returns the archives from a session, or `error` if there is an error.
 * @param { UseArchivesProps} props - The props for the hook.
 * @returns {Archive[] | 'error'} An array of Archives, or the text, `error`.
 */
const useArchives = ({ sessionKey }: UseArchivesProps) => {
  const { data, ...rest } = useArchivesBase({
    sessionKey,
    queryOptions: {
      enabled: !!sessionKey,
      refetchInterval: (query) => {
        const archives = query.state.data?.items;

        if (!archives || !hasPending(archives)) {
          return false;
        }

        return pollingIntervalMs;
      },
    },
  });

  const { i18n } = useTranslation();

  return {
    ...rest,
    data: useMemo(() => {
      if (!data) return undefined;

      return {
        ...data,
        items: data.items.map((archive) => {
          return createArchiveFromServer(i18n.language, archive as ServerArchive);
        }),
      };
    }, [data, i18n.language]),
  };
};

function hasPending<T extends SingleArchiveResponse>(archives: T[]): boolean {
  return archives.some((archive) => !['available', 'failed'].includes(archive.status));
}

export default useArchives;
