import { Archive, createArchiveFromServer, hasPending } from './model';
import { listArchives, startArchiving, stopArchiving } from './routes';

export type ArchiveResponse = {
  archives: Archive[];
  hasPending: boolean;
};

/**
 * Type definitions for user roles.
 * @typedef {string} TokenRole
 * @property {string} admin - The admin user role.
 * @property {string} participant - The participant user role.
 * @property {string} viewer - The viewer user role.
 */
export type TokenRole = 'admin' | 'participant' | 'viewer';

/**
 * Returns a list of archives and the status of the archives for a given meeting room.
 * @param {string} roomName - The roomName we check for archives
 * @param {string} tokenRole - The role of the user (e.g., admin, participant)
 * @returns {Promise<ArchiveResponse>} The archives from the meeting room (if any) and whether any archives are pending.
 */
const getArchives = async (roomName: string, tokenRole: TokenRole): Promise<ArchiveResponse> => {
  const response = await listArchives(roomName, tokenRole);
  const archivesFromServer = response?.data?.archives;
  if (archivesFromServer instanceof Array) {
    const archives = archivesFromServer.map((archiveFromServer) =>
      createArchiveFromServer(archiveFromServer)
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
