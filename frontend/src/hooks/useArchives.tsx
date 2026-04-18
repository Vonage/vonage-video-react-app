import { useArchives as useCoreArchives } from '@core/hooks';
import runtime$ from '@core/stores/runtime';
import { createArchiveFromServer } from '../api/archiving/model';

export type UseArchivesProps = {
  roomName: string;
};

const useArchives = ({ roomName }: UseArchivesProps) => {
  const language = runtime$.useLanguage();

  return useCoreArchives({
    sessionKey: roomName,
    queryOptions: {
      select: ({ items }) =>
        items?.map((item) =>
          createArchiveFromServer(language, {
            id: item.id,
            url: item.url ?? null,
            status: item.status as
              | 'available'
              | 'expired'
              | 'failed'
              | 'paused'
              | 'started'
              | 'stopped'
              | 'uploaded',
            createdAt: item.createdAt,
            duration: item.duration,
            size: item.size,
          })
        ),
    },
  });
};

export default useArchives;
