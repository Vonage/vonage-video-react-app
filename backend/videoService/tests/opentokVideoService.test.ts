import { describe, expect, it, jest } from '@jest/globals';

const mockSessionId = 'mockSessionId';
const mockToken = 'mockToken';
const mockApiKey = 'mockApplicationId';
const mockArchiveId = 'mockArchiveId';
const mockRoomName = 'awesomeRoomName';
const mockCaptionId = 'mockCaptionId';
const mockApiSecret = 'mockApiSecret';

await jest.unstable_mockModule('opentok', () => ({
  default: jest.fn().mockImplementation(() => ({
    createSession: jest.fn(
      (_options: unknown, callback: (err: unknown, session: { sessionId: string }) => void) => {
        callback(null, { sessionId: mockSessionId });
      }
    ),
    generateToken: jest.fn<() => { token: string; apiKey: string }>().mockReturnValue({
      token: mockToken,
      apiKey: mockApiKey,
    }),
    startArchive: jest.fn(
      (
        _sessionId: string,
        _options: unknown,
        callback: (
          err: unknown,
          session: {
            archive: {
              id: string;
            };
          }
        ) => void
      ) => {
        callback(null, {
          archive: {
            id: mockArchiveId,
          },
        });
      }
    ),
    stopArchive: jest.fn(
      (_archiveId: string, callback: (err: unknown, archive: { archiveId: string }) => void) => {
        callback(null, { archiveId: mockArchiveId });
      }
    ),
    listArchives: jest.fn(
      (_options: unknown, callback: (err: unknown, archives: [{ archiveId: string }]) => void) => {
        callback(null, [{ archiveId: mockArchiveId }]);
      }
    ),
  })),
  mediaMode: 'routed',
}));

await jest.unstable_mockModule('axios', () => ({
  default: {
    post: jest.fn<() => Promise<{ data: { captionsId: string } }>>().mockResolvedValue({
      data: { captionsId: mockCaptionId },
    }),
  },
}));

const { default: OpenTokVideoService } = await import('../opentokVideoService');

describe('OpentokVideoService', () => {
  let opentokVideoService: typeof OpenTokVideoService.prototype;

  beforeEach(() => {
    opentokVideoService = new OpenTokVideoService({
      apiKey: mockApiKey,
      apiSecret: mockApiSecret,
      provider: 'opentok',
    });
  });

  it('creates a session', async () => {
    const session = await opentokVideoService.createSession();
    expect(session).toBe(mockSessionId);
  });

  it('generates a token', () => {
    const result = opentokVideoService.generateToken(mockSessionId, 'admin');
    expect(result.token).toEqual({
      apiKey: mockApiKey,
      token: mockToken,
    });
  });

  it('starts an archive', async () => {
    const response = await opentokVideoService.startArchive(mockRoomName, mockSessionId);
    expect(response).toMatchObject({
      archive: {
        id: mockArchiveId,
      },
    });
  });

  it('stops an archive', async () => {
    const archiveResponse = await opentokVideoService.stopArchive(mockArchiveId);
    expect(archiveResponse).toBe(mockArchiveId);
  });

  it('generates a list of archives', async () => {
    const archiveResponse = await opentokVideoService.listArchives(mockSessionId);
    expect(archiveResponse).toEqual([{ archiveId: mockArchiveId }]);
  });

  it('enables captions', async () => {
    const captionResponse = await opentokVideoService.enableCaptions(mockSessionId, 'admin');
    expect(captionResponse.captionsId).toBe(mockCaptionId);
  });

  it('disables captions', async () => {
    const captionResponse = await opentokVideoService.disableCaptions(mockCaptionId);
    expect(captionResponse).toBe('Captions stopped successfully');
  });
});
