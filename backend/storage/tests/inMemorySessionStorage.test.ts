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
    });
  });
});
