import { getFormattedDate, getFormattedTime } from '../../utils/dateTime';

export type ArchiveStatus = 'available' | 'pending' | 'failed';
export type ServerArchiveStatus =
  | 'available'
  | 'expired'
  | 'failed'
  | 'paused'
  | 'started'
  | 'stopped'
  | 'uploaded';

export interface ServerArchive {
  id: string;
  url: string | null;
  status: ServerArchiveStatus;
  createdAt: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [others: string]: any;
}

export type Archive = {
  id: string;
  url: string | null;
  status: ArchiveStatus;
  createdAt: number;
  createdAtFormatted: string;
};

const getDateString = (locale: string, timestamp: number) => {
  return `${getFormattedDate(locale, timestamp)} ${getFormattedTime(locale, timestamp)}`;
};

const getArchiveStatus = (status: ServerArchiveStatus): ArchiveStatus => {
  switch (status) {
    case 'available':
      return 'available';
    case 'started':
    case 'stopped':
    case 'uploaded':
    case 'paused':
      return 'pending';
    default:
      return 'failed';
  }
};

/**
 * Modifies an archive retrieved from the server to be easily consumable.
 * @param {string} locale - current locale
 * @param {ServerArchive} serverArchive - The archive to be modified.
 * @returns {Archive} The modified archive.
 */
export const createArchiveFromServer = (locale: string, serverArchive: ServerArchive): Archive => {
  return {
    id: serverArchive.id,
    url: serverArchive.url,
    status: getArchiveStatus(serverArchive.status),
    createdAt: serverArchive.createdAt,
    createdAtFormatted: getDateString(locale, serverArchive.createdAt),
  };
};

/**
 * Checks if any of the archives are pending.
 * @param {Archive[]} archives - The archives to check.
 * @returns {boolean} Returns `true` if any archives are pending, else returns `false`.
 */
export const hasPending = (archives: Archive[]): boolean =>
  archives.some((archive) => archive.status === 'pending');
