import InMemorySessionStorage from '../inMemorySessionStorage';

describe('InMemorySessionStorage', () => {
  let storage: InMemorySessionStorage;
  const room = 'testRoom';

  beforeEach(() => {
    storage = new InMemorySessionStorage();
  });

  it('should return null for a session that does not exist', async () => {
    const session = await storage.getSession(room);
    expect(session).toBeNull();
  });

  it('should set and get a sessionId', async () => {
    await storage.setSession(room, 'session123');
    const session = await storage.getSession(room);
    expect(session).toBe('session123');
  });

  it('should return null for captionsId if not set', async () => {
    const captionsId = await storage.getCaptionsId(room);
    expect(captionsId).toBeNull();
  });

  it('should set and get captionsId', async () => {
    await storage.setCaptionsId(room, 'captionsABC');
    const captionsId = await storage.getCaptionsId(room);
    expect(captionsId).toBe('captionsABC');
  });

  it('should overwrite captionsId if set again', async () => {
    await storage.setCaptionsId(room, 'captionsABC');
    await storage.setCaptionsId(room, 'captionsXYZ');
    const captionsId = await storage.getCaptionsId(room);
    expect(captionsId).toBe('captionsXYZ');
  });

  it('should add captions users and return the correct count', async () => {
    let count = await storage.addCaptionsUser(room);
    expect(count).toBe(1);
    count = await storage.addCaptionsUser(room);
    expect(count).toBe(2);
  });

  it('should remove captions users', async () => {
    await storage.addCaptionsUser(room);
    await storage.addCaptionsUser(room);
    let count = await storage.removeCaptionsUser(room);
    expect(count).toBe(1);
    count = await storage.removeCaptionsUser(room);
    expect(count).toBe(0);
  });
});
