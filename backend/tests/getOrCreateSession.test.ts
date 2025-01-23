import { describe, expect, it, jest } from '@jest/globals';
import createGetOrCreateSession from '../routes/getOrCreateSession';
import { SessionStorage } from '../storage/sessionStorage';
import { VideoService } from '../videoService/videoServiceInterface';

const mockSessionsInStorage: { [key: string]: string } = {};
const mockVcrSessionStorage = {
  getSession: (key: string) => mockSessionsInStorage[key],
  setSession: (key: string, sessionId: string) => {
    mockSessionsInStorage[key] = sessionId;
  },
};
const createSessionMock = jest.fn<() => Promise<string>>().mockResolvedValue('some-session');

const mockVideoService = {
  createSession: createSessionMock,
};

describe('getOrCreateSession', () => {
  let getOrCreateSession: ReturnType<typeof createGetOrCreateSession>;
  beforeEach(() => {
    Object.getOwnPropertyNames(mockSessionsInStorage).forEach((prop) => {
      delete mockSessionsInStorage[prop];
    });
    // Clear in memory session storage before each test
    createSessionMock.mockReset();
    getOrCreateSession = createGetOrCreateSession({
      sessionService: mockVcrSessionStorage as unknown as SessionStorage,
      videoService: mockVideoService as unknown as VideoService,
    });
  });

  it('should only create one session for 2 simultaneous requests with the same room name', async () => {
    createSessionMock.mockResolvedValueOnce('session1');
    createSessionMock.mockResolvedValueOnce('session2');
    const request1 = getOrCreateSession('my-new-room');
    const request2 = getOrCreateSession('my-new-room');
    const sessionId1 = await request1;
    const sessionId2 = await request2;
    expect(sessionId1).toEqual('session1');
    expect(sessionId2).toEqual('session1');
  });

  it('should create two sessions for 2 simultaneous requests with different room names', async () => {
    createSessionMock.mockResolvedValueOnce('session1');
    createSessionMock.mockResolvedValueOnce('session2');
    const request1 = getOrCreateSession('my-new-room');
    const request2 = getOrCreateSession('my-new-room2');
    const sessionId1 = await request1;
    const sessionId2 = await request2;
    expect(sessionId1).toEqual('session1');
    expect(sessionId2).toEqual('session2');
  });

  it('should only create one session for 4 simultaneous requests with the same room name', async () => {
    createSessionMock.mockResolvedValueOnce('session1');
    createSessionMock.mockResolvedValueOnce('session2');
    const request1 = getOrCreateSession('my-new-room');
    const request2 = getOrCreateSession('my-new-room');
    const request3 = getOrCreateSession('my-new-room');
    const request4 = getOrCreateSession('my-new-room');
    const sessionId1 = await request1;
    const sessionId2 = await request2;
    const sessionId3 = await request3;
    const sessionId4 = await request4;
    expect(sessionId1).toEqual('session1');
    expect(sessionId2).toEqual('session1');
    expect(sessionId3).toEqual('session1');
    expect(sessionId4).toEqual('session1');
  });

  it('should create four sessions for 4 simultaneous requests with different same room names', async () => {
    createSessionMock.mockResolvedValueOnce('session1');
    createSessionMock.mockResolvedValueOnce('session2');
    createSessionMock.mockResolvedValueOnce('session3');
    createSessionMock.mockResolvedValueOnce('session4');
    const request1 = getOrCreateSession('my-new-room');
    const request2 = getOrCreateSession('my-new-room2');
    const request3 = getOrCreateSession('my-new-room3');
    const request4 = getOrCreateSession('my-new-room4');
    const sessionId1 = await request1;
    const sessionId2 = await request2;
    const sessionId3 = await request3;
    const sessionId4 = await request4;
    expect(sessionId1).toEqual('session1');
    expect(sessionId2).toEqual('session2');
    expect(sessionId3).toEqual('session3');
    expect(sessionId4).toEqual('session4');
  });
});
