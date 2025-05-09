import { describe, expect, it, jest } from '@jest/globals';

jest.mock('@vonage/auth');

const mockSessionId = 'mockSessionId';
const mockToken = 'mockToken';
const mockApplicationId = 'mockApplicationId';
const mockArchiveId = 'mockArchiveId';
const mockRoomName = 'awesomeRoomName';
const mockCaptionId = 'mockCaptionId';
const mockPrivateKey = 'mockPrivateKey';

await jest.unstable_mockModule('@vonage/video', () => {
  return {
    Video: jest.fn().mockImplementation(() => ({
      createSession: jest.fn<() => Promise<{ sessionId: string }>>().mockResolvedValue({
        sessionId: mockSessionId,
      }),
      generateClientToken: jest.fn<() => { token: string; apiKey: string }>().mockReturnValue({
        token: mockToken,
        apiKey: mockApplicationId,
      }),
      startArchive: jest.fn<() => Promise<{ id: string }>>().mockResolvedValue({
        id: mockArchiveId,
      }),
      stopArchive: jest.fn<() => Promise<{ status: number }>>().mockResolvedValue({
        status: 200,
      }),
      enableCaptions: jest.fn<() => Promise<{ captionsId: string }>>().mockResolvedValue({
        captionsId: mockCaptionId,
      }),
      disableCaptions: jest.fn<() => Promise<{ status: number }>>().mockResolvedValue({
        status: 200,
      }),
    })),
    LayoutType: {
      BEST_FIT: 'bestFit',
      HORIZONTAL_PRESENTATION: 'horizontalPresentation',
      CUSTOM: 'custom',
    },
    MediaMode: {
      ROUTED: 'routed',
    },
    Resolution: {
      FHD_LANDSCAPE: '1920x1080',
    },
  };
});

const { default: VonageVideoService } = await import('../vonageVideoService');

describe('VonageVideoService', () => {
  let vonageVideoService: typeof VonageVideoService.prototype;

  beforeEach(() => {
    vonageVideoService = new VonageVideoService({
      applicationId: mockApplicationId,
      privateKey: mockPrivateKey,
      provider: 'vonage',
    });
  });

  it('creates a session', async () => {
    const session = await vonageVideoService.createSession();
    expect(session).toBe(mockSessionId);
  });

  it('generates a token', () => {
    const result = vonageVideoService.generateToken(mockSessionId);
    expect(result.token).toEqual({
      apiKey: mockApplicationId,
      token: mockToken,
    });
  });

  it('starts an archive', async () => {
    const archive = await vonageVideoService.startArchive(mockRoomName, mockSessionId);
    expect(archive.id).toBe(mockArchiveId);
  });

  it('stops an archive', async () => {
    const archiveResponse = await vonageVideoService.stopArchive(mockArchiveId);
    expect(archiveResponse).toBe('Archive stopped successfully');
  });

  it('enables captions', async () => {
    const captionResponse = await vonageVideoService.enableCaptions(mockSessionId);
    expect(captionResponse.captionsId).toBe(mockCaptionId);
  });

  it('disables captions', async () => {
    const captionResponse = await vonageVideoService.disableCaptions(mockCaptionId);
    expect(captionResponse).toBe('Captions stopped successfully');
  });
});
