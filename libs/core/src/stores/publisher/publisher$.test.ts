import type { Publisher } from '@vonage/client-sdk-video';
import { FacingMode } from '@common/types';
import mediaDevices$ from '@core/stores/devices';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import publisher$ from './publisher$';
import { isMobile } from '@web/platform';
import { ErrorCode } from '@core/errors';

vi.mock('@web/platform', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@web/platform')>();

  return {
    ...actual,
    isMobile: vi.fn(() => true),
  };
});

describe('publisher$.actions.getFacingMode', () => {
  beforeEach(() => {
    mediaDevices$.reset();
  });

  it('throws when facing mode is requested on non-mobile devices', () => {
    expect.assertions(1);
    vi.mocked(isMobile).mockReturnValue(false);

    const publisher = {
      getVideoSource: vi.fn(),
    } as unknown as Publisher;

    try {
      publisher$.actions.getFacingMode({ publisher });
    } catch (error) {
      expect(error).toMatchObject({
        type: ErrorCode.FacingModeNotSupported,
        fallbackMessage: 'Camera facing mode is only supported on mobile devices.',
      });
    }
  });

  it('resolves facing mode through all runtime branches', () => {
    runCase({
      label: 'returns unknown when track or deviceId is missing',
      publisher: makePublisher({ videoSource: {} }),
      expected: FacingMode.unknown,
    });

    runCase({
      label: 'returns direct user facingMode from track settings',
      publisher: makePublisher({
        videoSource: {
          deviceId: 'camera-user',
          track: makeTrack({ facingMode: FacingMode.user }),
        },
      }),
      expected: FacingMode.user,
    });

    runCase({
      label: 'returns direct environment facingMode from track settings',
      publisher: makePublisher({
        videoSource: {
          deviceId: 'camera-environment',
          track: makeTrack({ facingMode: FacingMode.environment }),
        },
      }),
      expected: FacingMode.environment,
    });

    runCase({
      label: 'returns unknown when track facingMode is missing and no label exists',
      publisher: makePublisher({
        videoSource: {
          deviceId: 'camera-missing-label',
          track: makeTrack({}),
        },
      }),
      expected: FacingMode.unknown,
    });

    runCase({
      label: 'infers environment from rear-facing keywords',
      publisher: makePublisher({
        videoSource: {
          deviceId: 'camera-rear',
          track: makeTrack({}),
        },
      }),
      devices: [
        {
          deviceId: 'camera-rear',
          kind: 'videoinput',
          label: 'Back Camera',
          groupId: 'group-rear',
        } as MediaDeviceInfo,
      ],
      expected: FacingMode.environment,
    });

    runCase({
      label: 'infers user from front-facing keywords',
      publisher: makePublisher({
        videoSource: {
          deviceId: 'camera-front',
          track: makeTrack({}),
        },
      }),
      devices: [
        {
          deviceId: 'camera-front',
          kind: 'videoinput',
          label: 'FaceTime HD Camera',
          groupId: 'group-front',
        } as MediaDeviceInfo,
      ],
      expected: FacingMode.user,
    });

    runCase({
      label: 'returns unknown when label has no front/rear keywords',
      publisher: makePublisher({
        videoSource: {
          deviceId: 'camera-unknown',
          track: makeTrack({}),
        },
      }),
      devices: [
        {
          deviceId: 'camera-unknown',
          kind: 'videoinput',
          label: 'External USB Camera',
          groupId: 'group-unknown',
        } as MediaDeviceInfo,
      ],
      expected: FacingMode.unknown,
    });
  });
});

function makePublisher({
  videoSource,
}: {
  videoSource?: { track?: MediaStreamTrack; deviceId?: string };
}): Publisher {
  return {
    getVideoSource: vi.fn().mockReturnValue(videoSource),
  } as unknown as Publisher;
}

function runCase({
  label,
  publisher,
  expected,
  devices,
}: {
  label: string;
  publisher: Publisher;
  expected: FacingMode;
  devices?: MediaDeviceInfo[];
}) {
  mediaDevices$.setState((state) => ({
    ...state,
    mediaDeviceInfo: devices ?? [],
  }));

  expect(publisher$.actions.getFacingMode({ publisher }), label).toBe(expected);
}

function makeTrack({ facingMode }: { facingMode?: FacingMode | string }): MediaStreamTrack {
  return {
    getSettings: () => ({ facingMode }),
  } as unknown as MediaStreamTrack;
}
