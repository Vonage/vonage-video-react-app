import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import UpstashRedisSessionStorage from './upstashRedisSessionStorage';

type RedisCommand = (string | number)[];

const restUrl = 'https://example.upstash.io';

// Minimal stand-in for the Upstash REST API, see https://upstash.com/docs/redis/features/restapi
const makeFakeUpstash = () => {
  const values = new Map<string, string>();
  const expirations = new Map<string, number>();

  const execute = ([name, key, ...args]: RedisCommand) => {
    const redisKey = String(key);
    switch (name) {
      case 'GET':
        return { result: values.get(redisKey) ?? null };
      case 'SET':
        values.set(redisKey, String(args[0]));
        expirations.set(redisKey, Number(args[2]));
        return { result: 'OK' };
      case 'DEL':
        return { result: Number(values.delete(redisKey)) };
      case 'EXPIRE':
        expirations.set(redisKey, Number(args[0]));
        return { result: 1 };
      case 'INCR':
      case 'DECR': {
        const count = Number(values.get(redisKey) ?? 0) + (name === 'INCR' ? 1 : -1);
        values.set(redisKey, String(count));
        return { result: count };
      }
      default:
        return { error: `ERR unknown command '${name}'` };
    }
  };

  const fetchMock = vi.fn((url: string, init: { body: string }) => {
    const body = JSON.parse(init.body) as RedisCommand | RedisCommand[];
    const result = url.endsWith('/pipeline')
      ? (body as RedisCommand[]).map(execute)
      : execute(body as RedisCommand);
    return Promise.resolve(new Response(JSON.stringify(result), { status: 200 }));
  });

  return { values, expirations, fetchMock };
};

describe('UpstashRedisSessionStorage', () => {
  let fakeUpstash: ReturnType<typeof makeFakeUpstash>;
  let storage: UpstashRedisSessionStorage;

  beforeEach(() => {
    fakeUpstash = makeFakeUpstash();
    vi.stubGlobal('fetch', fakeUpstash.fetchMock);
    storage = new UpstashRedisSessionStorage({ restUrl, restToken: 'token' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stores a session by room name and session id with a 4 hour expiry', async () => {
    await storage.setSession({ roomName: 'room', sessionKey: 'key', sessionId: 'id' });

    expect(await storage.getSessionKeyByRoomName({ roomName: 'room' })).toBe('key');
    expect(await storage.getSessionKeyBySessionId({ sessionId: 'id' })).toBe('key');
    expect(fakeUpstash.expirations.get('room:sessionKey')).toBe(60 * 60 * 4);
    expect(fakeUpstash.fetchMock).toHaveBeenCalledWith(
      `${restUrl}/pipeline`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token' }),
      })
    );
  });

  it('round-trips structured values', async () => {
    await storage.setArchiveIds({ sessionId: 'id', archiveIds: ['a', 'b'] });
    await storage.setAuthTransaction({
      transactionId: 'tx',
      state: 'state',
      codeVerifier: 'verifier',
      returnTo: '/room/test',
    });

    expect(await storage.getArchiveIds({ sessionId: 'id' })).toEqual(['a', 'b']);
    expect(await storage.getAuthTransaction({ transactionId: 'tx' })).toEqual({
      state: 'state',
      codeVerifier: 'verifier',
      returnTo: '/room/test',
    });
    expect(fakeUpstash.expirations.get('tx:authTransaction')).toBe(60 * 10);
  });

  it('counts captions users atomically and never goes below zero', async () => {
    expect(await storage.incrementCaptionsUserCount({ sessionKey: 'key' })).toBe(1);
    expect(await storage.incrementCaptionsUserCount({ sessionKey: 'key' })).toBe(2);
    expect(await storage.decrementCaptionsUserCount({ sessionKey: 'key' })).toBe(1);
    expect(await storage.decrementCaptionsUserCount({ sessionKey: 'key' })).toBe(0);
    expect(await storage.decrementCaptionsUserCount({ sessionKey: 'key' })).toBe(0);
    expect(fakeUpstash.values.has('key:captionsUserCount')).toBe(false);
  });

  it('throws when Upstash rejects the request', async () => {
    fakeUpstash.fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    );

    await expect(storage.getCaptionsId({ sessionId: 'id' })).rejects.toThrow('status 401');
  });
});
