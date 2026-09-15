/* eslint-disable @typescript-eslint/await-thenable */
import { jest } from '@jest/globals';

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
 * Registers the same third-party SDK mocks (`@vonage/auth`, `@vonage/video`, and the legacy
 * `opentokVideoService`) that any test importing `../server` needs, since `makeVideoClient$()`
 * constructs a real SDK client at module load time. Must be awaited before `../server` is
 * imported — jest.unstable_mockModule only takes effect on modules imported afterwards.
 *
 * Uses `jest.unstable_mockModule` directly rather than `doPartialMock`: these SDKs export
 * classes, and a jest mock function isn't structurally assignable to a class's constructor
 * type, which `doPartialMock`'s generic (built for plain function/object modules like
 * `config.ts`) can't accommodate.
 *
 * `videoOverrides` lets a suite override specific SDK methods (e.g. to reject for a
 * particular id) while keeping the rest of the happy-path defaults below.
 *
 * jest.unstable_mockModule resolves relative specifiers against the calling *test* file, not
 * this file — hence `../videoService/...` below, not `../../videoService/...`. That means this
 * helper only works from test files directly under `backend/tests/`.
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

  await jest.unstable_mockModule('@vonage/auth', () => ({
    ...actualAuth,
    Auth: jest.fn().mockImplementation(() => ({ applicationId: 'vonageAppId' })),
  }));

  await jest.unstable_mockModule('@vonage/video', () => ({
    ...actualVideo,
    Video: jest.fn().mockImplementation(() => ({
      createSession: jest
        .fn<() => Promise<{ sessionId: string }>>()
        .mockResolvedValue({ sessionId: validSessionId }),
      generateClientToken: jest.fn().mockReturnValue('someToken'),
      startArchive: jest
        .fn<(sessionId: string) => Promise<ArchiveResponse>>()
        .mockResolvedValue({ id: 'archiveId', status: 'started' }),
      stopArchive: jest
        .fn<(archiveId: string) => Promise<ArchiveResponse>>()
        .mockImplementation((archiveId: string) =>
          Promise.resolve({ id: archiveId, status: 'stopped' })
        ),
      searchArchives: jest
        .fn<() => Promise<{ items: unknown[]; count: number }>>()
        .mockResolvedValue({ items: [], count: 0 }),
      enableCaptions: jest
        .fn<() => Promise<CaptionsResponse>>()
        .mockResolvedValue({ captionsId: DEFAULT_CAPTIONS_ID }),
      disableCaptions: jest
        .fn<(captionsId: string) => Promise<void>>()
        .mockResolvedValue(undefined),
      ...videoOverrides,
    })),
  }));

  await jest.unstable_mockModule('../videoService/opentokVideoService.ts', () => ({
    default: jest.fn().mockImplementation(() => ({
      startArchive: jest.fn<() => Promise<string>>().mockResolvedValue('archiveId'),
      stopArchive: jest.fn<() => Promise<string>>().mockResolvedValue('archiveId'),
      enableCaptions: jest.fn<() => Promise<string>>().mockResolvedValue('captionsId'),
      disableCaptions: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      generateToken: jest
        .fn<() => Promise<{ token: string; apiKey: string }>>()
        .mockResolvedValue({ token: 'someToken', apiKey: 'someApiKey' }),
      createSession: jest.fn<() => Promise<string>>().mockResolvedValue(validSessionId),
      searchArchives: jest.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
    })),
  }));
}

export default mockVonageVideoSdk;
