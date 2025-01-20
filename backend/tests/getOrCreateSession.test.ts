import { describe, expect, it, jest } from '@jest/globals';
import { Archive } from 'opentok';

await jest.unstable_mockModule('../helpers/config', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
        applicationId: 'test-application-id',
        privateKey: 'test-private-key',
        provider: 'opentok',
      };
    }),
  };
});

const mockVcrSessionStorage = {
  getSession: jest.fn().mockReturnValue('someSessionId'),
  setSession: jest.fn().mockReturnValue(true),
};

jest.mock('../storage/vcrSessionStorage', () => {
  return jest.fn().mockImplementation(() => mockVcrSessionStorage);
});

const getCredentialsMock = jest.fn<() => Promise<{ sessionId: string }>>().mockResolvedValue({
  sessionId: 'session1',
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
        createSession: getCredentialsMock,
        listArchives: jest
          .fn<() => Promise<Archive[]>>()
          .mockResolvedValue([{ id: 'archive1' }, { id: 'archive2' }] as unknown as Archive[]),
        getCredentials: getCredentialsMock,
      };
    }),
  };
});

const { getOrCreateSession } = await import('../routes/session');

// TODO: cleanup this file and simplify mocks / imports
describe('getOrCreateSession', () => {
  it('should only create one session for 2 simultaneous requests', async () => {
    mockVcrSessionStorage.getSession.mockReturnValue('');
    getCredentialsMock.mockResolvedValueOnce({
      sessionId: 'session1',
    });
    getCredentialsMock.mockResolvedValueOnce({
      sessionId: 'session2',
    });
    const request1 = getOrCreateSession('my-new-room');
    const request2 = getOrCreateSession('my-new-room');
    const response1 = await request1;
    const response2 = await request2;
    expect(response1.sessionId).toEqual('session1');
    expect(response2.sessionId).toEqual('session1');
  });

  it('should only create one session for 4 simultaneous requests', async () => {
    mockVcrSessionStorage.getSession.mockReturnValue('');
    getCredentialsMock.mockResolvedValueOnce({
      sessionId: 'session1',
    });
    getCredentialsMock.mockResolvedValueOnce({
      sessionId: 'session2',
    });
    const request1 = getOrCreateSession('my-new-room');
    const request2 = getOrCreateSession('my-new-room');
    const request3 = getOrCreateSession('my-new-room');
    const request4 = getOrCreateSession('my-new-room');
    const response1 = await request1;
    const response2 = await request2;
    const response3 = await request3;
    const response4 = await request4;
    expect(response1.sessionId).toEqual('session1');
    expect(response2.sessionId).toEqual('session1');
    expect(response3.sessionId).toEqual('session1');
    expect(response4.sessionId).toEqual('session1');
  });
});
