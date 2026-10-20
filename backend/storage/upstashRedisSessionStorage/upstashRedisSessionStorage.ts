import type { SessionStorage } from '../sessionStorage';

const ENTRY_EXPIRATION_TIME = 60 * 60 * 4; // 4 hours in seconds
const AUTH_TRANSACTION_EXPIRATION_TIME = 60 * 10; // 10 minutes in seconds, single-use PKCE/CSRF handshake data
const DEFAULT_ACCESS_TOKEN_EXPIRATION_TIME = 60 * 60; // 1 hour in seconds, used when the token response has no expires_in
const SERVER_ROTATION_PENDING_EXPIRATION_TIME = 30; // if the archive hook doesn't arrive within 30s, the flag is stale anyway

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

type RedisCommand = (string | number)[];

type RedisResponse = { result: unknown } | { error: string };

type AuthTransaction = { state: string; codeVerifier: string; returnTo: string };

export type UpstashRedisConfig = {
  restUrl: string;
  restToken: string;
};

function makeKey(resource: StorageResource, id: string): string {
  return `${id}:${resource}`;
}

/**
 * Reads the Upstash Redis REST credentials. Vercel's Upstash Marketplace integration injects
 * KV_REST_API_URL / KV_REST_API_TOKEN, a database created directly on Upstash uses the
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN names.
 * @returns {UpstashRedisConfig | null} the config, or null when no database is configured.
 */
export function getUpstashRedisConfig(): UpstashRedisConfig | null {
  const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!restUrl || !restToken) return null;

  return { restUrl: restUrl.replace(/\/+$/, ''), restToken };
}

/**
 * Session storage backed by Upstash Redis over its REST API, so it works from serverless
 * functions (e.g. Vercel) where every request may hit a different instance.
 * See https://upstash.com/docs/redis/features/restapi
 */
class UpstashRedisSessionStorage implements SessionStorage {
  constructor(private readonly config: UpstashRedisConfig) {}

  private async request<T>(path: string, body: RedisCommand | RedisCommand[]): Promise<T> {
    const response = await fetch(`${this.config.restUrl}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.restToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json().catch(() => null)) as T | null;

    if (!response.ok || payload === null) {
      throw new Error(`Upstash Redis request failed with status ${response.status}`);
    }

    return payload;
  }

  private static unwrap(response: RedisResponse): unknown {
    if ('error' in response) {
      throw new Error(`Upstash Redis command failed: ${response.error}`);
    }
    return response.result;
  }

  private async command(command: RedisCommand): Promise<unknown> {
    return UpstashRedisSessionStorage.unwrap(await this.request<RedisResponse>('', command));
  }

  private async pipeline(commands: RedisCommand[]): Promise<unknown[]> {
    const responses = await this.request<RedisResponse[]>('/pipeline', commands);
    return responses.map(UpstashRedisSessionStorage.unwrap);
  }

  private async getJson<T>(key: string): Promise<T | null> {
    const value = await this.command(['GET', key]);
    if (typeof value !== 'string') return null;
    return JSON.parse(value) as T;
  }

  private async setJson({
    key,
    value,
    expirationTime = ENTRY_EXPIRATION_TIME,
  }: {
    key: string;
    value: unknown;
    expirationTime?: number;
  }): Promise<void> {
    await this.command(['SET', key, JSON.stringify(value), 'EX', expirationTime]);
  }

  private async delete(key: string): Promise<void> {
    await this.command(['DEL', key]);
  }

  async getSessionKeyByRoomName({ roomName }: { roomName: string }): Promise<string | null> {
    const key = makeKey(StorageResource.SessionKeyByRoomName, roomName);
    const sessionKey = await this.getJson<string>(key);
    if (!sessionKey) return null;

    // Sliding 4 hour expiry. After this time, accessing the room lands on a different session.
    await this.command(['EXPIRE', key, ENTRY_EXPIRATION_TIME]);
    return sessionKey;
  }

  async getSessionKeyBySessionId({ sessionId }: { sessionId: string }): Promise<string | null> {
    return this.getJson<string>(makeKey(StorageResource.SessionKeyBySessionId, sessionId));
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
    const value = JSON.stringify(sessionKey);
    await this.pipeline([
      [
        'SET',
        makeKey(StorageResource.SessionKeyByRoomName, roomName),
        value,
        'EX',
        ENTRY_EXPIRATION_TIME,
      ],
      [
        'SET',
        makeKey(StorageResource.SessionKeyBySessionId, sessionId),
        value,
        'EX',
        ENTRY_EXPIRATION_TIME,
      ],
    ]);
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
      await this.delete(key);
      return;
    }
    await this.setJson({ key, value: captionsId });
  }

  async getCaptionsId({ sessionId }: { sessionId: string }): Promise<string | null> {
    return this.getJson<string>(makeKey(StorageResource.CaptionsId, sessionId));
  }

  async incrementCaptionsUserCount({ sessionKey }: { sessionKey: string }): Promise<number> {
    const key = makeKey(StorageResource.CaptionsUserCount, sessionKey);
    const [captionsUserCount] = await this.pipeline([
      ['INCR', key],
      ['EXPIRE', key, ENTRY_EXPIRATION_TIME],
    ]);
    return Number(captionsUserCount);
  }

  async decrementCaptionsUserCount({ sessionKey }: { sessionKey: string }): Promise<number> {
    const key = makeKey(StorageResource.CaptionsUserCount, sessionKey);
    // Clamp and expire inside Redis so a delayed response cannot delete a concurrent join.
    const captionsUserCount = await this.command([
      'EVAL',
      `local count = redis.call('DECR', KEYS[1])
       if count <= 0 then
         redis.call('DEL', KEYS[1])
         return 0
       end
       redis.call('EXPIRE', KEYS[1], ARGV[1])
       return count`,
      1,
      key,
      ENTRY_EXPIRATION_TIME,
    ]);
    return Number(captionsUserCount);
  }

  async setArchiveIds({
    sessionId,
    archiveIds,
  }: {
    sessionId: string;
    archiveIds: string[];
  }): Promise<void> {
    await this.setJson({ key: makeKey(StorageResource.ArchiveIds, sessionId), value: archiveIds });
  }

  async getArchiveIds({ sessionId }: { sessionId: string }): Promise<string[]> {
    const archiveIds = await this.getJson<string[]>(makeKey(StorageResource.ArchiveIds, sessionId));
    return archiveIds ?? [];
  }

  async setAuthTransaction({
    transactionId,
    state,
    codeVerifier,
    returnTo,
  }: {
    transactionId: string;
  } & AuthTransaction): Promise<void> {
    await this.setJson({
      key: makeKey(StorageResource.AuthTransaction, transactionId),
      value: { state, codeVerifier, returnTo },
      expirationTime: AUTH_TRANSACTION_EXPIRATION_TIME,
    });
  }

  async getAuthTransaction({
    transactionId,
  }: {
    transactionId: string;
  }): Promise<AuthTransaction | null> {
    return this.getJson<AuthTransaction>(makeKey(StorageResource.AuthTransaction, transactionId));
  }

  async deleteAuthTransaction({ transactionId }: { transactionId: string }): Promise<void> {
    await this.delete(makeKey(StorageResource.AuthTransaction, transactionId));
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
    await this.setJson({
      key: makeKey(StorageResource.AccessToken, sessionId),
      value: accessToken,
      expirationTime: expiresInSeconds ?? DEFAULT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
  }

  async getAccessToken({ sessionId }: { sessionId: string }): Promise<string | null> {
    return this.getJson<string>(makeKey(StorageResource.AccessToken, sessionId));
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
      await this.delete(key);
      return;
    }
    await this.setJson({
      key,
      value: '1',
      expirationTime: SERVER_ROTATION_PENDING_EXPIRATION_TIME,
    });
  }

  async getServerRotationPending({ sessionId }: { sessionId: string }): Promise<boolean> {
    const value = await this.getJson<string>(
      makeKey(StorageResource.ServerRotationPending, sessionId)
    );
    return value === '1';
  }
}

export default UpstashRedisSessionStorage;
