import { vcr } from '@vonage/vcr-sdk';
import { SessionStorage } from './sessionStorage';

const ENTRY_EXPIRATION_TIME = 60 * 60 * 4; // 4 hours in seconds
const AUTH_TRANSACTION_EXPIRATION_TIME = 60 * 10; // 10 minutes in seconds, single-use PKCE/CSRF handshake data
const DEFAULT_ACCESS_TOKEN_EXPIRATION_TIME = 60 * 60; // 1 hour in seconds, used when the token response has no expires_in

enum StorageResource {
  SessionKeyByRoomName = 'sessionKey',
  SessionKeyBySessionId = 'sessionKeyById',
  CaptionsId = 'captionsId',
  CaptionsUserCount = 'captionsUserCount',
  ArchiveIds = 'archiveIds',
  AuthTransaction = 'authTransaction',
  AccessToken = 'accessToken',
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

  async setAuthTransaction({
    transactionId,
    state,
    codeVerifier,
    returnTo,
  }: {
    transactionId: string;
    state: string;
    codeVerifier: string;
    returnTo: string;
  }): Promise<void> {
    const key = makeKey(StorageResource.AuthTransaction, transactionId);
    await this.dbState.set(key, { state, codeVerifier, returnTo });
    await this.setKeyExpiry(key, AUTH_TRANSACTION_EXPIRATION_TIME);
  }

  async getAuthTransaction({
    transactionId,
  }: {
    transactionId: string;
  }): Promise<{ state: string; codeVerifier: string; returnTo: string } | null> {
    const key = makeKey(StorageResource.AuthTransaction, transactionId);
    const transaction: { state: string; codeVerifier: string; returnTo: string } | null =
      await this.dbState.get(key);

    return transaction ?? null;
  }

  async deleteAuthTransaction({ transactionId }: { transactionId: string }): Promise<void> {
    const key = makeKey(StorageResource.AuthTransaction, transactionId);
    await this.dbState.delete(key);
  }

  async setAccessToken({
    sessionId,
    accessToken,
    expiresInSeconds,
  }: {
    sessionId: string;
    accessToken: string;
    expiresInSeconds?: number;
  }): Promise<void> {
    const key = makeKey(StorageResource.AccessToken, sessionId);
    await this.dbState.set(key, accessToken);
    await this.setKeyExpiry(key, expiresInSeconds ?? DEFAULT_ACCESS_TOKEN_EXPIRATION_TIME);
  }

  async getAccessToken({ sessionId }: { sessionId: string }): Promise<string | null> {
    const key = makeKey(StorageResource.AccessToken, sessionId);
    const accessToken: string | null = await this.dbState.get(key);

    return accessToken ?? null;
  }

  async setServerRotationPending({
    sessionId,
    pending,
  }: {
    sessionId: string;
    pending: boolean;
  }): Promise<void> {
    const key = makeKey(StorageResource.ServerRotationPending, sessionId);
    if (!pending) {
      await this.dbState.delete(key);
      return;
    }
    // Short TTL — if archive hook doesn't arrive within 30s, the flag is stale anyway.
    await this.dbState.set(key, '1');
    await this.dbState.expire(key, 30);
  }

  async getServerRotationPending({ sessionId }: { sessionId: string }): Promise<boolean> {
    const key = makeKey(StorageResource.ServerRotationPending, sessionId);
    const value: string | null = await this.dbState.get(key);
    return value === '1';
  }
}
export default VcrSessionStorage;
