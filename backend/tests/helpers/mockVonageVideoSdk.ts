import { vi } from 'vitest';

type ArchiveResponse = { id: string; status: string };
type CaptionsResponse = { captionsId: string };

// base64('2~vonageAppId~0.0.0.0~2024-01-01') — valid format for decodeSessionId
export const DEFAULT_VALID_SESSION_ID = '1_Mn52b25hZ2VBcHBJZH4wLjAuMC4wfjIwMjQtMDEtMDE=';
export const DEFAULT_CAPTIONS_ID = '123e4567-a12b-41a2-a123-123456789012';

type VideoSdkOverrides = Partial<{
  createSession: () => Promise<{ sessionId: string }>;
  generateClientToken: () => string;
  startArchive: (sessionId: string) => Promise<ArchiveResponse>;
  stopArchive: (archiveId: string) => Promise<ArchiveResponse>;
  searchArchives: () => Promise<{ items: unknown[]; count: number }>;
  enableCaptions: () => Promise<CaptionsResponse>;
  disableCaptions: (captionsId: string) => Promise<void>;
}>;

/**
 * Must be awaited before `../server` is imported — vi.doMock only takes effect
 * on modules imported afterwards.
 *
 * vi.doMock resolves relative specifiers against this file, not the calling test file.
 */
async function mockVonageVideoSdk({
  validSessionId = DEFAULT_VALID_SESSION_ID,
  videoOverrides = {},
}: {
  validSessionId?: string;
  videoOverrides?: VideoSdkOverrides;
} = {}): Promise<void> {
  const actualAuth = await import('@vonage/auth');
  const actualVideo = await import('@vonage/video');

  vi.doMock('@vonage/auth', () => ({
    ...actualAuth,
    Auth: vi.fn().mockImplementation(() => ({ applicationId: 'vonageAppId' })),
  }));

  vi.doMock('@vonage/video', () => ({
    ...actualVideo,
    Video: vi.fn().mockImplementation(() => ({
      createSession: vi
        .fn<[], Promise<{ sessionId: string }>>()
        .mockResolvedValue({ sessionId: validSessionId }),
      generateClientToken: vi.fn().mockReturnValue('someToken'),
      startArchive: vi
        .fn<[sessionId: string], Promise<ArchiveResponse>>()
        .mockResolvedValue({ id: 'archiveId', status: 'started' }),
      stopArchive: vi
        .fn<[archiveId: string], Promise<ArchiveResponse>>()
        .mockImplementation((archiveId: string) =>
          Promise.resolve({ id: archiveId, status: 'stopped' })
        ),
      searchArchives: vi
        .fn<[], Promise<{ items: unknown[]; count: number }>>()
        .mockResolvedValue({ items: [], count: 0 }),
      enableCaptions: vi
        .fn<[], Promise<CaptionsResponse>>()
        .mockResolvedValue({ captionsId: DEFAULT_CAPTIONS_ID }),
      disableCaptions: vi.fn<[captionsId: string], Promise<void>>().mockResolvedValue(undefined),
      ...videoOverrides,
    })),
  }));

  vi.doMock('../../videoService/opentokVideoService.ts', () => ({
    default: vi.fn().mockImplementation(() => ({
      startArchive: vi.fn<[], Promise<string>>().mockResolvedValue('archiveId'),
      stopArchive: vi.fn<[], Promise<string>>().mockResolvedValue('archiveId'),
      enableCaptions: vi.fn<[], Promise<string>>().mockResolvedValue('captionsId'),
      disableCaptions: vi.fn<[], Promise<void>>().mockResolvedValue(undefined),
      generateToken: vi
        .fn<[], Promise<{ token: string; apiKey: string }>>()
        .mockResolvedValue({ token: 'someToken', apiKey: 'someApiKey' }),
      createSession: vi.fn<[], Promise<string>>().mockResolvedValue(validSessionId),
      searchArchives: vi.fn<[], Promise<unknown[]>>().mockResolvedValue([]),
    })),
  }));
}

export default mockVonageVideoSdk;
