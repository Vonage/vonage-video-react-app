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

  describe('getSession', () => {
    it('should return null for a session that does not exist', async () => {
      const session = await storage.getSessionKeyByRoomName({ roomName: room });
      expect(session).toBeNull();
    });
    it('should set and get a sessionId', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      const session = await storage.getSessionKeyByRoomName({ roomName: room });
      expect(session).toBe(sessionKey);
    });
  });

  describe('setSession', () => {
    it('should set and get a sessionId', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      const session = await storage.getSessionKeyByRoomName({ roomName: room });
      expect(session).toBe(sessionKey);
      const captionId = await storage.getCaptionsId({ sessionId });
      expect(captionId).toBeNull();
    });
  });

  describe('getCaptionsId', () => {
    it('should return null for captionsId if not set', async () => {
      const captionsId = await storage.getCaptionsId({ sessionId });
      expect(captionsId).toBeNull();
    });
    it('should set and get captionsId', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      await storage.setCaptionsId({ sessionId, captionsId: 'captionsABC' });
      const captionsId = await storage.getCaptionsId({ sessionId });
      expect(captionsId).toBe('captionsABC');
    });
  });

  describe('setCaptionsId', () => {
    it('should throw error when setting captionsId for non-existent session', async () => {
      await expect(storage.setCaptionsId({ sessionId, captionsId: 'captionsABC' })).rejects.toThrow(
        `Session for id: ${sessionId} does not exist. Cannot set captionsId.`
      );
    });

    it('should overwrite captionsId if set again', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      await storage.setCaptionsId({ sessionId, captionsId: 'captionsABC' });
      await storage.setCaptionsId({ sessionId, captionsId: 'captionsXYZ' });
      const captionsId = await storage.getCaptionsId({ sessionId });
      expect(captionsId).toBe('captionsXYZ');
    });
  });

  describe('addCaptionsUserCount', () => {
    it('should add captions users and return the correct count', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      let count = await storage.incrementCaptionsUserCount({ sessionKey });
      expect(count).toBe(1);
      count = await storage.incrementCaptionsUserCount({ sessionKey });
      expect(count).toBe(2);
    });
    it('should throw an error when adding captions user to non-existent session', async () => {
      await expect(storage.incrementCaptionsUserCount({ sessionKey })).rejects.toThrow(
        `Session for key: ${sessionKey} does not exist. Cannot add captions user.`
      );
    });
  });

  describe('removeCaptionsUserCount', () => {
    it('should remove captions users', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      void storage.incrementCaptionsUserCount({ sessionKey });
      void storage.incrementCaptionsUserCount({ sessionKey });
      let count = await storage.decrementCaptionsUserCount({ sessionKey });
      expect(count).toBe(1);
      count = await storage.decrementCaptionsUserCount({ sessionKey });
      expect(count).toBe(0);
    });

    it('should not allow removing captions user count below zero', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      await storage.incrementCaptionsUserCount({ sessionKey });
      for (let i = 0; i < 5; i++) {
        const count = await storage.decrementCaptionsUserCount({ sessionKey });
        expect(count).toBe(0);
      }
    });

    it('should throw an error when removing captions user from non-existent session', async () => {
      await expect(storage.decrementCaptionsUserCount({ sessionKey })).rejects.toThrow(
        `Session for key: ${sessionKey} does not exist. Cannot remove captions user.`
      );
    });
  });

  describe('getSessionKeyBySessionId', () => {
    it('should return null for an unknown sessionId', async () => {
      const result = await storage.getSessionKeyBySessionId({ sessionId });
      expect(result).toBeNull();
    });

    it('should return the sessionKey after setSession is called with that sessionId', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      const result = await storage.getSessionKeyBySessionId({ sessionId });
      expect(result).toBe(sessionKey);
    });
  });

  describe('setArchiveIds / getArchiveIds', () => {
    it('should return an empty array for an unknown sessionId', async () => {
      const archiveIds = await storage.getArchiveIds({ sessionId });
      expect(archiveIds).toEqual([]);
    });

    it('should throw error when setting archiveIds for non-existent session', async () => {
      await expect(storage.setArchiveIds({ sessionId, archiveIds: ['archive1'] })).rejects.toThrow(
        `Session for id: ${sessionId} does not exist. Cannot set archiveIds.`
      );
    });

    it('should set and get archiveIds', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      await storage.setArchiveIds({ sessionId, archiveIds: ['archive1', 'archive2'] });
      const archiveIds = await storage.getArchiveIds({ sessionId });
      expect(archiveIds).toEqual(['archive1', 'archive2']);
    });
  });

  describe('setServerRotationPending / getServerRotationPending', () => {
    it('should return false for an unknown sessionId', async () => {
      const pending = await storage.getServerRotationPending({ sessionId });
      expect(pending).toBe(false);
    });

    it('should return false by default after setSession', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      const pending = await storage.getServerRotationPending({ sessionId });
      expect(pending).toBe(false);
    });

    it('should return true after setServerRotationPending(true)', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      await storage.setServerRotationPending({ sessionId, pending: true });
      const pending = await storage.getServerRotationPending({ sessionId });
      expect(pending).toBe(true);
    });

    it('should reset to false after setServerRotationPending(false)', async () => {
      await storage.setSession({ roomName: room, sessionKey, sessionId });
      await storage.setServerRotationPending({ sessionId, pending: true });
      await storage.setServerRotationPending({ sessionId, pending: false });
      const pending = await storage.getServerRotationPending({ sessionId });
      expect(pending).toBe(false);
    });

    it('should silently no-op for an unknown sessionId', async () => {
      await expect(
        storage.setServerRotationPending({ sessionId, pending: true })
      ).resolves.toBeUndefined();
    });
  });
});
