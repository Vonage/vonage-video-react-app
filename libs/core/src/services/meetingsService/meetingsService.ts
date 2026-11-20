import type { SessionKey } from '@common/types';
import isArchivedBeyondRetention from './helpers/isArchivedBeyondRetention';
import toSavedMeetingId from './helpers/toSavedMeetingId';
import { parseMeetingsExport } from './schemas/MeetingsExport.schema';
import type { MeetingsExport, SavedMeeting, SavedMeetingId } from './types';

const databaseName = 'vonage-video-meetings';
const databaseVersion = 1;
const storeName = 'meetings';

const meetingsService = {
  async listMeetings(): Promise<SavedMeeting[]> {
    const [meetings] = await runTransaction<SavedMeeting[]>({
      mode: 'readonly',
      operation: (store) => [store.getAll()],
    });

    return meetings;
  },

  async putMeeting({ sessionKey }: { sessionKey: SessionKey }): Promise<SavedMeeting> {
    const id = toSavedMeetingId({ sessionKey });

    const [existingMeeting] = await runTransaction<SavedMeeting | undefined>({
      mode: 'readonly',
      operation: (store) => [store.get(id)],
    });

    if (existingMeeting) return existingMeeting;

    const meeting: SavedMeeting = { id, sessionKey, savedAt: Date.now(), archivedAt: null };

    await runTransaction({ mode: 'readwrite', operation: (store) => [store.put(meeting)] });

    return meeting;
  },

  archiveMeeting({ id }: { id: SavedMeetingId }): Promise<SavedMeeting> {
    return setArchivedAt({ id, archivedAt: Date.now() });
  },

  restoreMeeting({ id }: { id: SavedMeetingId }): Promise<SavedMeeting> {
    return setArchivedAt({ id, archivedAt: null });
  },

  async deleteMeeting({ id }: { id: SavedMeetingId }): Promise<void> {
    await runTransaction({ mode: 'readwrite', operation: (store) => [store.delete(id)] });
  },

  async exportMeetings(): Promise<MeetingsExport> {
    const meetings = await meetingsService.listMeetings();

    return { version: 1, exportedAt: Date.now(), meetings };
  },

  /**
   * Adds the meetings of an export that are not on this device yet; existing records are kept as they are.
   */
  async importMeetings(data: unknown): Promise<SavedMeeting[]> {
    const { meetings } = parseMeetingsExport(data);
    const existingMeetings = await meetingsService.listMeetings();
    const existingIds = new Set(existingMeetings.map(({ id }) => id));

    const newMeetingsById = new Map(
      meetings.filter(({ id }) => !existingIds.has(id)).map((meeting) => [meeting.id, meeting])
    );
    const newMeetings = [...newMeetingsById.values()];

    await runTransaction({
      mode: 'readwrite',
      operation: (store) => newMeetings.map((meeting) => store.put(meeting)),
    });

    return newMeetings;
  },

  async purgeArchivedMeetings(): Promise<void> {
    const meetings = await meetingsService.listMeetings();
    const expiredMeetings = meetings.filter(isArchivedBeyondRetention);

    await runTransaction({
      mode: 'readwrite',
      operation: (store) => expiredMeetings.map(({ id }) => store.delete(id)),
    });
  },
};

async function setArchivedAt({
  id,
  archivedAt,
}: {
  id: SavedMeetingId;
  archivedAt: number | null;
}): Promise<SavedMeeting> {
  const [existingMeeting] = await runTransaction<SavedMeeting | undefined>({
    mode: 'readonly',
    operation: (store) => [store.get(id)],
  });

  if (!existingMeeting) throw new Error(`Saved meeting not found: ${id}`);

  const meeting: SavedMeeting = { ...existingMeeting, archivedAt };

  await runTransaction({ mode: 'readwrite', operation: (store) => [store.put(meeting)] });

  return meeting;
}

async function runTransaction<Result>({
  mode,
  operation,
}: {
  mode: IDBTransactionMode;
  operation: (store: IDBObjectStore) => IDBRequest[];
}): Promise<Result[]> {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);

    request.onupgradeneeded = () => request.result.createObjectStore(storeName, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const requests = operation(transaction.objectStore(storeName));

    transaction.oncomplete = () => {
      database.close();
      resolve(requests.map(({ result }) => result as Result));
    };

    transaction.onabort = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

export default meetingsService;
