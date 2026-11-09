import { vcr } from '@vonage/vcr-sdk';
import { SessionStorage } from './sessionStorage';

const ENTRY_EXPIRATION_TIME = 60 * 60 * 4; // 4 hours in seconds

enum StorageResource {
  SessionKeyByRoomName = 'sessionKey',
  SessionKeyBySessionId = 'sessionKeyById',
  CaptionsId = 'captionsId',
  ArchiveIds = 'archiveIds',
  ServerRotationPending = 'serverRotationPending',
}

function makeKey(resource: StorageResource, id: string): string {
  return `${id}:${resource}`;
}

class VcrSessionStorage implements SessionStorage {
  dbState = vcr.getInstanceState();
  private async setKeyExpiry(
    key: string,
    expirationTime: number = ENTRY_EXPIRATION_TIME
  ): Promise<void> {
    // if you try to access a room after the expiry time, you will land on a different session.
    await this.dbState.expire(key, expirationTime);
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

  async getSessionKeyBySessionId({ sessionId }: { sessionId: string }): Promise<string | null> {
    const key = makeKey(StorageResource.SessionKeyBySessionId, sessionId);
    const sessionKey: string | null = await this.dbState.get(key);
    return sessionKey ?? null;
  }

  async setSession({
    roomName,
    sessionKey,
    sessionId,
  }: {
    roomName: string;
    sessionKey: string;
    sessionId: string;
  }): Promise<void> {
    const roomKey = makeKey(StorageResource.SessionKeyByRoomName, roomName);
    await this.dbState.set(roomKey, sessionKey);
    await this.setKeyExpiry(roomKey);

    const sessionIdKey = makeKey(StorageResource.SessionKeyBySessionId, sessionId);
    await this.dbState.set(sessionIdKey, sessionKey);
    await this.setKeyExpiry(sessionIdKey);
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

  async setServerRotationPending({
    sessionId,
    pending,
  }: {
    sessionId: string;
    pending: number;
  }): Promise<void> {
    const key = makeKey(StorageResource.ServerRotationPending, sessionId);
    if (pending <= 0) {
      await this.dbState.delete(key);
      return;
    }
    await this.dbState.set(key, String(pending));
    await this.dbState.expire(key, 30);
  }

  async getServerRotationPending({ sessionId }: { sessionId: string }): Promise<number> {
    const key = makeKey(StorageResource.ServerRotationPending, sessionId);
    const value: string | null = await this.dbState.get(key);
    return value ? Number.parseInt(value, 10) : 0;
  }
}
export default VcrSessionStorage;
