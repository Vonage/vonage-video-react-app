import { Archive, createArchiveFromServer, hasPending } from './model';
import { listArchives, startArchiving, stopArchiving } from './routes';

export type ArchiveResponse = {
  archives: Archive[];
  hasPending: boolean;
};

/**
 * Returns a list of archives and the status of the archives for a given meeting room.
 * @param {string} locale - current locale
 * @param {string} roomName - The roomName we check for archives
 * @returns {Promise<ArchiveResponse>} The archives from the meeting room (if any) and whether any archives are pending.
 */
const getArchives = async (locale: string, roomName: string): Promise<ArchiveResponse> => {
  const response = await listArchives(roomName);
  const archivesFromServer = response?.data?.archives;
  if (archivesFromServer instanceof Array) {
    const archives = archivesFromServer.map((archiveFromServer) =>
      createArchiveFromServer(locale, archiveFromServer)
    );
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

export { startArchiving, stopArchiving, getArchives };
