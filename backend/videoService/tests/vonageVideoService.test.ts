import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@vonage/auth');

const mockSessionId = 'mockSessionId';
const mockToken = 'mockToken';
const mockApplicationId = 'mockApplicationId';
const mockArchiveId = 'mockArchiveId';
const mockRoomName = 'awesomeRoomName';
const mockCaptionId = 'mockCaptionId';
const mockPrivateKey = 'mockPrivateKey';

vi.doMock('@vonage/video', () => {
  return {
    Video: vi.fn().mockImplementation(() => ({
      createSession: vi.fn<[], Promise<{ sessionId: string }>>().mockResolvedValue({
        sessionId: mockSessionId,
      }),
      generateClientToken: vi.fn<[], { token: string; apiKey: string }>().mockReturnValue({
        token: mockToken,
        apiKey: mockApplicationId,
      }),
      startArchive: vi.fn<[], Promise<{ id: string }>>().mockResolvedValue({
        id: mockArchiveId,
      }),
      stopArchive: vi.fn<[], Promise<{ status: number }>>().mockResolvedValue({
        status: 200,
      }),
      enableCaptions: vi.fn<[], Promise<{ captionsId: string }>>().mockResolvedValue({
        captionsId: mockCaptionId,
      }),
      disableCaptions: vi.fn<[], Promise<{ status: number }>>().mockResolvedValue({
        status: 200,
      }),
      searchArchives: vi.fn<[], Promise<{ items: [] }>>().mockResolvedValue({
        items: [],
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
const { Video } = await import('@vonage/video');

describe('VonageVideoService', () => {
  let vonageVideoService: typeof VonageVideoService.prototype;
  const videoConstructor = vi.mocked(Video);

  beforeEach(() => {
    videoConstructor.mockClear();

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

  it('passes videoHost options to the Video constructor when videoHost is provided', () => {
    new VonageVideoService({
      applicationId: mockApplicationId,
      privateKey: mockPrivateKey,
      provider: 'vonage',
      videoHost: 'https://video.api.dev.vonage.com',
    });

    expect(videoConstructor).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        videoHost: 'https://video.api.dev.vonage.com',
      })
    );
  });
});
