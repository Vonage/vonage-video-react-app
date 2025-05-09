import { describe, expect, it, jest } from '@jest/globals';

jest.mock('@vonage/auth');

await jest.unstable_mockModule('@vonage/video', () => {
  return {
    Video: jest.fn().mockImplementation(() => ({
      createSession: jest.fn<() => Promise<{ sessionId: string }>>().mockResolvedValue({
        sessionId: '12345',
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
      applicationId: 'abcd-1234',
      privateKey: 'blah-blah-blah',
      provider: 'vonage',
    });
  });

  it('can create a session', async () => {
    const session = await vonageVideoService.createSession();
    expect(session).toBe('12345');
  });
});
