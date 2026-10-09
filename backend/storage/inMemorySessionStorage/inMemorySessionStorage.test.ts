import InMemorySessionStorage from '../inMemorySessionStorage';
import type { SessionStorage } from '../sessionStorage';

describe('InMemorySessionStorage', () => {
  let storage: SessionStorage;

  const room = 'testRoom';
  const sessionKey = 'session123';
  const sessionId = 'vonage-session-id';

  beforeEach(() => {
    storage = new InMemorySessionStorage();
  });

  describe('setSession / getSessionKeyByRoomName', () => {
    it('should store and retrieve a session key by room name', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      const result = await storage.getSessionKeyByRoomName({ roomName: room });
      expect(result).toBe(sessionKey);
    });
  });

  describe('getSessionKeyBySessionId', () => {
    it('should return the session key after a session is created', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      const result = await storage.getSessionKeyBySessionId({ sessionId });
      expect(result).toBe(sessionKey);
    });
  });

  describe('setCaptionsId / getCaptionsId', () => {
    it('should set and retrieve captionsId', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      await storage.setCaptionsId({ sessionId, captionsId: 'captionsABC' });
      const captionsId = await storage.getCaptionsId({ sessionId });
      expect(captionsId).toBe('captionsABC');
    });

    it('should throw when setting captionsId for a non-existent session', async () => {
      await expect(storage.setCaptionsId({ sessionId, captionsId: 'captionsABC' })).rejects.toThrow(
        `Session for id: ${sessionId} does not exist. Cannot set captionsId.`
      );
    });

    it('should overwrite captionsId when set again', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      await storage.setCaptionsId({ sessionId, captionsId: 'captionsABC' });
      await storage.setCaptionsId({ sessionId, captionsId: 'captionsXYZ' });
      const captionsId = await storage.getCaptionsId({ sessionId });
      expect(captionsId).toBe('captionsXYZ');
    });
  });

  describe('incrementCaptionsUserCount / decrementCaptionsUserCount', () => {
    it('should increment and decrement the count correctly', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      expect(await storage.incrementCaptionsUserCount({ sessionKey })).toBe(1);
      expect(await storage.incrementCaptionsUserCount({ sessionKey })).toBe(2);
      expect(await storage.decrementCaptionsUserCount({ sessionKey })).toBe(1);
      expect(await storage.decrementCaptionsUserCount({ sessionKey })).toBe(0);
    });

    it('should not decrement below zero', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      await storage.incrementCaptionsUserCount({ sessionKey });
      await storage.decrementCaptionsUserCount({ sessionKey });
      const count = await storage.decrementCaptionsUserCount({ sessionKey });
      expect(count).toBe(0);
    });

    it('should throw when incrementing on a non-existent session', async () => {
      await expect(storage.incrementCaptionsUserCount({ sessionKey })).rejects.toThrow(
        `Session for key: ${sessionKey} does not exist. Cannot add captions user.`
      );
    });

    it('should throw when decrementing on a non-existent session', async () => {
      await expect(storage.decrementCaptionsUserCount({ sessionKey })).rejects.toThrow(
        `Session for key: ${sessionKey} does not exist. Cannot remove captions user.`
      );
    });
  });

  describe('setArchiveIds / getArchiveIds', () => {
    it('should set and retrieve archive ids', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      await storage.setArchiveIds({ sessionId, archiveIds: ['archive1', 'archive2'] });
      const archiveIds = await storage.getArchiveIds({ sessionId });
      expect(archiveIds).toEqual(['archive1', 'archive2']);
    });

    it('should throw when setting archive ids for a non-existent session', async () => {
      await expect(storage.setArchiveIds({ sessionId, archiveIds: ['archive1'] })).rejects.toThrow(
        `Session for id: ${sessionId} does not exist. Cannot set archiveIds.`
      );
    });
  });

  describe('setServerRotationPending / getServerRotationPending', () => {
    it('should set and retrieve the pending flag', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      await storage.setServerRotationPending({ sessionId, pending: true });
      expect(await storage.getServerRotationPending({ sessionId })).toBe(true);
    });

    it('should silently no-op for an unknown sessionId', async () => {
      await expect(
        storage.setServerRotationPending({ sessionId, pending: true })
      ).resolves.toBeUndefined();
    });
  });
});
