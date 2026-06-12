import { vcr } from '@vonage/vcr-sdk';
import { SessionStorage } from './sessionStorage';

const ENTRY_EXPIRATION_TIME = 60 * 60 * 4; // 4 hours in seconds

enum StorageResource {
  SessionKeyByRoomName = 'sessionKey',
  CaptionsId = 'captionsId',
  CaptionsUserCount = 'captionsUserCount',
  ArchiveIds = 'archiveIds',
}

function makeKey(resource: StorageResource, id: string): string {
  return `${id}:${resource}`;
}

class VcrSessionStorage implements SessionStorage {
  dbState = vcr.getInstanceState();
  private async setKeyExpiry(key: string): Promise<void> {
    // if you try to access a room after the expiry time, you will land on a different session.
    await this.dbState.expire(key, ENTRY_EXPIRATION_TIME);
  }
  async getSessionKeyByRoomName({ roomName }: { roomName: string }): Promise<string | null> {
    const key = makeKey(StorageResource.SessionKeyByRoomName, roomName);
    const session: string | null = await this.dbState.get(key);
    if (!session) {
      return null;
    }
    // setting expiry of 4 hours for the key. After this time
    // if you try to access a room, you will land on a different session Id.
    await this.setKeyExpiry(key);
    return session;
  }

  async setSession({
    roomName,
    sessionKey,
  }: {
    roomName: string;
    sessionKey: string;
    sessionId: string;
  }): Promise<void> {
    const key = makeKey(StorageResource.SessionKeyByRoomName, roomName);
    await this.dbState.set(key, sessionKey);
    // setting expiry on the set command in case the room is
    // created before hand but never accessed.
    await this.setKeyExpiry(key);
  }

  async setCaptionsId({
    sessionId,
    captionsId,
  }: {
    sessionId: string;
    captionsId: string | null;
  }): Promise<void> {
    const key = makeKey(StorageResource.CaptionsId, sessionId);
    if (captionsId === null) {
      await this.dbState.delete(key);
      return;
    }
    await this.dbState.set(key, captionsId);
    await this.setKeyExpiry(key);
  }

  async getCaptionsId({ sessionId }: { sessionId: string }): Promise<string | null> {
    const key = makeKey(StorageResource.CaptionsId, sessionId);
    const captionsId: string | null = await this.dbState.get(key);

    return captionsId ?? null;
  }

  async incrementCaptionsUserCount({ sessionKey }: { sessionKey: string }): Promise<number> {
    const key = makeKey(StorageResource.CaptionsUserCount, sessionKey);
    const currentCaptionsUsersCount = await this.dbState.get(key);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const newCaptionsUsersCount = currentCaptionsUsersCount ? currentCaptionsUsersCount + 1 : 1;
    await this.dbState.set(key, newCaptionsUsersCount);
    await this.setKeyExpiry(key);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return newCaptionsUsersCount;
  }

  async decrementCaptionsUserCount({ sessionKey }: { sessionKey: string }): Promise<number> {
    const key = makeKey(StorageResource.CaptionsUserCount, sessionKey);
    const currentCaptionsUsersCount = await this.dbState.get(key);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const newCaptionsUsersCount = currentCaptionsUsersCount ? currentCaptionsUsersCount - 1 : 0;
    if (newCaptionsUsersCount < 0) {
      await this.dbState.delete(key);
      return 0;
    }
    await this.dbState.set(key, newCaptionsUsersCount);
    await this.setKeyExpiry(key);

    return newCaptionsUsersCount;
  }

  async setArchiveIds({
    sessionId,
    archiveIds,
  }: {
    sessionId: string;
    archiveIds: string[];
  }): Promise<void> {
    const key = makeKey(StorageResource.ArchiveIds, sessionId);
    await this.dbState.set(key, archiveIds);
    await this.setKeyExpiry(key);
  }

  async getArchiveIds({ sessionId }: { sessionId: string }): Promise<string[]> {
    const key = makeKey(StorageResource.ArchiveIds, sessionId);
    const archiveIds: string[] | null = await this.dbState.get(key);
    return archiveIds ?? [];
  }
}
export default VcrSessionStorage;
