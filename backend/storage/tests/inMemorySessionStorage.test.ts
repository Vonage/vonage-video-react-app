import InMemorySessionStorage from '../inMemorySessionStorage';

describe('InMemorySessionStorage', () => {
  let storage: InMemorySessionStorage;
  const room = 'testRoom';

  beforeEach(() => {
    storage = new InMemorySessionStorage();
  });

  describe('getSession', () => {
    it('should return null for a session that does not exist', async () => {
      const session = await storage.getSession(room);
      expect(session).toBeNull();
    });
    it('should set and get a sessionId', async () => {
      await storage.setSession(room, 'session123');
      const session = await storage.getSession(room);
      expect(session).toBe('session123');
    });
  });

  describe('setSession', () => {
    it('should set and get a sessionId', async () => {
      await storage.setSession(room, 'session123');
      const session = await storage.getSession(room);
      expect(session).toBe('session123');
      const captionId = await storage.getCaptionsId(room);
      expect(captionId).toBeNull();
    });
  });

  describe('getCaptionsId', () => {
    it('should return null for captionsId if not set', async () => {
      const captionsId = await storage.getCaptionsId(room);
      expect(captionsId).toBeNull();
    });
    it('should set and get captionsId', async () => {
      await storage.setSession(room, 'session123');
      await storage.setCaptionsId(room, 'captionsABC');
      const captionsId = await storage.getCaptionsId(room);
      expect(captionsId).toBe('captionsABC');
    });
  });

  describe('setCaptionsId', () => {
    it('should throw error when setting captionsId for non-existent session', async () => {
      await expect(storage.setCaptionsId(room, 'captionsABC')).rejects.toThrow(
        `Session for room: ${room} does not exist. Cannot set captionsId.`
      );
    });

    it('should overwrite captionsId if set again', async () => {
      await storage.setSession(room, 'session123');
      await storage.setCaptionsId(room, 'captionsABC');
      await storage.setCaptionsId(room, 'captionsXYZ');
      const captionsId = await storage.getCaptionsId(room);
      expect(captionsId).toBe('captionsXYZ');
    });
  });

  describe('addCaptionsUserCount', () => {
    it('should add captions users and return the correct count', async () => {
      await storage.setSession(room, 'session123');
      let count = await storage.incrementCaptionsUserCount(room);
      expect(count).toBe(1);
      count = await storage.incrementCaptionsUserCount(room);
      expect(count).toBe(2);
    });
    it('should throw an error when adding captions user to non-existent session', async () => {
      await expect(storage.incrementCaptionsUserCount(room)).rejects.toThrow(
        `Session for room: ${room} does not exist. Cannot add captions user.`
      );
    });
  });

  describe('removeCaptionsUserCount', () => {
    it('should remove captions users', async () => {
      await storage.setSession(room, 'session123');
      storage.incrementCaptionsUserCount(room);
      storage.incrementCaptionsUserCount(room);
      let count = await storage.decrementCaptionsUserCount(room);
      expect(count).toBe(1);
      count = await storage.decrementCaptionsUserCount(room);
      expect(count).toBe(0);
    });

    it('should not allow removing captions user count below zero', async () => {
      await storage.setSession(room, 'session123');
      await storage.incrementCaptionsUserCount(room);
      for (let i = 0; i < 5; i++) {
        // eslint-disable-next-line no-await-in-loop
        const count = await storage.decrementCaptionsUserCount(room);
        expect(count).toBe(0);
      }
    });

    it('should throw an error when removing captions user from non-existent session', async () => {
      await expect(storage.decrementCaptionsUserCount(room)).rejects.toThrow(
        `Session for room: ${room} does not exist. Cannot remove captions user.`
      );
    });
  });
});
