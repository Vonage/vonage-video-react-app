import { render as renderBase, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import type { Publisher } from '@vonage/client-sdk-video';
import { makeTestProvider, providers } from '@test/providers';
import composeProviders from '@web/helpers/composeProviders';
import SuspenseBoundary from '@web/components/SuspenseBoundary/SuspenseBoundary';
import {
  setupWindowNavigatorMock,
  makeMediaStreamMock,
  makeMediaDeviceInfos,
} from '@web-test/fixtures';
import VideoStatsOverlay from './VideoStatsOverlay';

const mockDevices = makeMediaDeviceInfos();

const mockPublisher = {
  videoWidth: vi.fn().mockReturnValue(1280),
  videoHeight: vi.fn().mockReturnValue(720),
  getVideoSource: vi.fn().mockReturnValue({
    track: {
      getSettings: vi.fn().mockReturnValue({ frameRate: 30 }),
    },
  }),
} as unknown as Publisher;

describe('VideoStatsOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockPublisher.videoWidth as ReturnType<typeof vi.fn>).mockReturnValue(1280);
    (mockPublisher.videoHeight as ReturnType<typeof vi.fn>).mockReturnValue(720);
    (mockPublisher.getVideoSource as ReturnType<typeof vi.fn>).mockReturnValue({
      track: {
        getSettings: vi.fn().mockReturnValue({ frameRate: 30 }),
      },
    });

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(mockDevices),
        getUserMedia: Promise.resolve(makeMediaStreamMock({})),
      },
    });

    vi.spyOn(globalThis.navigator.permissions, 'query').mockResolvedValue({
      state: 'granted',
    } as PermissionStatus);
  });

  it('should render the stats badge with resolution and framerate', async () => {
    render(<VideoStatsOverlay />);

    expect(await screen.findByTestId('video-stats-overlay')).toBeInTheDocument();
    expect(screen.getByText('720p 30fps')).toBeInTheDocument();
  });

  it('should render only resolution when framerate is not available', async () => {
    (mockPublisher.getVideoSource as ReturnType<typeof vi.fn>).mockReturnValue({
      track: null,
    });

    render(<VideoStatsOverlay />);

    expect(await screen.findByText('720p')).toBeInTheDocument();
  });

  it('should display "–" when no stats are available', async () => {
    (mockPublisher.videoWidth as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
    (mockPublisher.videoHeight as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
    (mockPublisher.getVideoSource as ReturnType<typeof vi.fn>).mockReturnValue({
      track: null,
    });

    render(<VideoStatsOverlay />);

    expect(await screen.findByText('–')).toBeInTheDocument();
  });

  it('should display 1080p for full HD resolution', async () => {
    (mockPublisher.videoWidth as ReturnType<typeof vi.fn>).mockReturnValue(1920);
    (mockPublisher.videoHeight as ReturnType<typeof vi.fn>).mockReturnValue(1080);

    render(<VideoStatsOverlay />);

    expect(await screen.findByText(/1080p/)).toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const { wrapper: roomWrapper, ...context } = makeTestProvider(
    [providers.user, providers.previewPublisher],
    {
      userContext: undefined,
      previewPublisherContext: {
        __onCreated: (ctx) => {
          ctx.publisher = mockPublisher;
        },
      },
    }
  );

  const wrapper = composeProviders(SuspenseBoundary, roomWrapper);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
