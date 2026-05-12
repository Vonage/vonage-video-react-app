import { type VideoClient } from '@core/services';
import { Archive, createArchiveFromServer, hasPending, type ServerArchive } from '../model';

export type ArchiveResponse = {
  archives: Archive[];
  hasPending: boolean;
};

/**
 * Returns a list of archives and the status of the archives for a given meeting room.
 * @param {string} locale - current locale
 * @param {string} sessionId - The session ID to search archives for
 * @param {VideoClient} videoClient - The video client instance to use for searching archives
 * @returns {Promise<ArchiveResponse>} The archives from the meeting room (if any) and whether any archives are pending.
 */
const getArchives = async ({
  locale,
  sessionKey,
  videoClient,
}: {
  locale: string;
  sessionKey: string;
  videoClient: VideoClient;
}): Promise<ArchiveResponse> => {
  const response = await videoClient.searchArchives({ sessionKey });
  const archivesFromServer = response?.items;

  if (archivesFromServer instanceof Array) {
    const archives = archivesFromServer.map((archiveFromServer) => {
      return createArchiveFromServer(locale, archiveFromServer as ServerArchive);
    });

    return {
      archives,
      hasPending: hasPending(archives),
    };
  }

  return {
    archives: [],
    hasPending: false,
  };
};

export default getArchives;
