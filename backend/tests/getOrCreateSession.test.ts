import { describe, expect, it, jest } from '@jest/globals';
import { Archive } from 'opentok';
import mockOpentokConfig from '../helpers/__mocks__/config';

await jest.unstable_mockModule('../helpers/config', mockOpentokConfig);

const mockSessionsInStorage: { [key: string]: string } = {};
const mockVcrSessionStorage = {
  getSession: (key: string) => mockSessionsInStorage[key],
  setSession: (key: string, sessionId: string) => {
    mockSessionsInStorage[key] = sessionId;
  },
};

await jest.unstable_mockModule('../storage/inMemorySessionStorage.ts', () => {
  return {
    default: jest.fn().mockImplementation(() => mockVcrSessionStorage),
  };
});

const createSessionMock = jest.fn<() => Promise<{ sessionId: string }>>().mockResolvedValue({
  sessionId: 'some-session',
});

await jest.unstable_mockModule('../opentok', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        startArchive: jest.fn<() => Promise<string>>().mockResolvedValue('archiveId'),
        stopArchive: jest.fn<() => Promise<string>>().mockRejectedValue('invalid archive'),
        generateToken: jest
          .fn<() => Promise<{ token: string; apiKey: string }>>()
          .mockResolvedValue({
            token: 'someToken',
            apiKey: 'someApiKey',
          }),
        createSession: createSessionMock,
        listArchives: jest
          .fn<() => Promise<Archive[]>>()
          .mockResolvedValue([{ id: 'archive1' }, { id: 'archive2' }] as unknown as Archive[]),
      };
    }),
  };
});

const { getOrCreateSession } = await import('../routes/session');

describe('getOrCreateSession', () => {
  beforeEach(() => {
    // Clear in memory session storage before each test
    Object.getOwnPropertyNames(mockSessionsInStorage).forEach((prop) => {
      delete mockSessionsInStorage[prop];
    });
    createSessionMock.mockReset();
  });

  it('should only create one session for 2 simultaneous requests with the same room name', async () => {
    createSessionMock.mockResolvedValueOnce({
      sessionId: 'session1',
    });
    createSessionMock.mockResolvedValueOnce({
      sessionId: 'session2',
    });
    const request1 = getOrCreateSession('my-new-room');
    const request2 = getOrCreateSession('my-new-room');
    const sessionId1 = await request1;
    const sessionId2 = await request2;
    expect(sessionId1).toEqual('session1');
    expect(sessionId2).toEqual('session1');
  });

  it('should create two sessions for 2 simultaneous requests with different room names', async () => {
    createSessionMock.mockResolvedValueOnce({
      sessionId: 'session1',
    });
    createSessionMock.mockResolvedValueOnce({
      sessionId: 'session2',
    });
    const request1 = getOrCreateSession('my-new-room');
    const request2 = getOrCreateSession('my-new-room2');
    const sessionId1 = await request1;
    const sessionId2 = await request2;
    expect(sessionId1).toEqual('session1');
    expect(sessionId2).toEqual('session2');
  });

  it('should only create one session for 4 simultaneous requests with the same room name', async () => {
    createSessionMock.mockResolvedValueOnce({
      sessionId: 'session1',
    });
    createSessionMock.mockResolvedValueOnce({
      sessionId: 'session2',
    });
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
    createSessionMock.mockResolvedValueOnce({
      sessionId: 'session1',
    });
    createSessionMock.mockResolvedValueOnce({
      sessionId: 'session2',
    });
    createSessionMock.mockResolvedValueOnce({
      sessionId: 'session3',
    });
    createSessionMock.mockResolvedValueOnce({
      sessionId: 'session4',
    });
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
