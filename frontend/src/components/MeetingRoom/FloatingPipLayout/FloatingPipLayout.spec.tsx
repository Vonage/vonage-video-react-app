import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import usePublisherContext from '@hooks/usePublisherContext';
import useSessionContext from '@hooks/useSessionContext';
import usePreferredCameras from '@hooks/usePreferredCameras';
import { PublisherContextType } from '@Context/PublisherProvider';
import { SubscriberWrapper } from '../../../types/session';
import FloatingPipLayout from './FloatingPipLayout';

vi.mock('@hooks/usePublisherContext', () => ({ default: vi.fn() }));
vi.mock('@hooks/useSessionContext', () => ({ default: vi.fn() }));
vi.mock('@hooks/usePreferredCameras', () => ({ default: vi.fn() }));
vi.mock('../../Subscriber', () => ({
  default: ({ subscriberWrapper }: { subscriberWrapper: { id: string } }) => (
    <div data-testid={`subscriber-stub-${subscriberWrapper.id}`} />
  ),
}));
vi.mock('@vonage/client-sdk-video', () => ({
  hasMediaProcessorSupport: () => true,
}));
vi.mock('@web/platform', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@web/platform')>();
  return {
    ...actual,
    isMobile: () => true,
  };
});
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const makeRemoteSubscriber = (): SubscriberWrapper =>
  ({
    id: 'remote-1',
    element: document.createElement('video'),
    isPinned: false,
    isScreenshare: false,
    subscriber: {
      stream: {
        hasVideo: true,
        initials: 'JS',
        name: 'John Smith',
      },
    },
  }) as unknown as SubscriberWrapper;

const makePublisherContext = (
  overrides: Partial<PublisherContextType> = {}
): PublisherContextType =>
  ({
    publisherVideoElement: document.createElement('video'),
    isVideoEnabled: true,
    publisher: {
      stream: { initials: 'ME', name: 'Me' },
      getVideoSource: vi.fn().mockReturnValue({ deviceId: 'front-1' }),
      setVideoSource: vi.fn().mockResolvedValue(undefined),
    },
    ...overrides,
  }) as unknown as PublisherContextType;

const mockSession = () =>
  vi
    .mocked(useSessionContext)
    .mockReturnValue({ toggleBackgroundEffects: vi.fn() } as unknown as ReturnType<
      typeof useSessionContext
    >);

const mockCameras = (devices: Array<{ deviceId: string; label: string; kind: string }>): void => {
  vi.mocked(usePreferredCameras).mockReturnValue(devices as unknown);
};

const tapSelfPip = () => {
  const selfPip = screen.getByTestId('floating-pip-self');
  fireEvent.pointerDown(selfPip, { pointerId: 1, clientX: 10, clientY: 10 });
  fireEvent.pointerUp(selfPip, { pointerId: 1, clientX: 10, clientY: 10 });
};

describe('FloatingPipLayout', () => {
  beforeEach(() => {
    mockSession();
    vi.mocked(usePublisherContext).mockReturnValue(makePublisherContext());
  });

  it('renders canvas, remote container, and self PiP', () => {
    mockCameras([
      { deviceId: 'front-1', label: 'Front camera', kind: 'videoinput' },
      { deviceId: 'rear-1', label: 'Back camera', kind: 'videoinput' },
    ]);

    render(<FloatingPipLayout remoteSubscriber={makeRemoteSubscriber()} />);

    expect(screen.getByTestId('floating-pip-layout')).toBeInTheDocument();
    expect(screen.getByTestId('floating-pip-remote-remote-1')).toBeInTheDocument();
    expect(screen.getByTestId('floating-pip-self')).toBeInTheDocument();
  });

  it('hides the camera switch and background effects buttons by default', () => {
    mockCameras([
      { deviceId: 'front-1', label: 'Front camera', kind: 'videoinput' },
      { deviceId: 'rear-1', label: 'Back camera', kind: 'videoinput' },
    ]);

    render(<FloatingPipLayout remoteSubscriber={makeRemoteSubscriber()} />);

    expect(screen.queryByTestId('floating-pip-camera-switch')).not.toBeInTheDocument();
    expect(screen.queryByTestId('floating-pip-background-effects')).not.toBeInTheDocument();
  });

  it('reveals the camera switch button on tap when multiple cameras exist', () => {
    mockCameras([
      { deviceId: 'front-1', label: 'Front camera', kind: 'videoinput' },
      { deviceId: 'rear-1', label: 'Back camera', kind: 'videoinput' },
    ]);

    render(<FloatingPipLayout remoteSubscriber={makeRemoteSubscriber()} />);
    act(() => {
      tapSelfPip();
    });

    expect(screen.getByTestId('floating-pip-camera-switch')).toBeInTheDocument();
  });

  it('keeps the camera switch button hidden after tap when only one camera exists', () => {
    mockCameras([{ deviceId: 'front-1', label: 'Front camera', kind: 'videoinput' }]);

    render(<FloatingPipLayout remoteSubscriber={makeRemoteSubscriber()} />);
    act(() => {
      tapSelfPip();
    });

    expect(screen.queryByTestId('floating-pip-camera-switch')).not.toBeInTheDocument();
  });

  it('auto-hides the revealed controls after the hide delay', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockCameras([
      { deviceId: 'front-1', label: 'Front camera', kind: 'videoinput' },
      { deviceId: 'rear-1', label: 'Back camera', kind: 'videoinput' },
    ]);

    render(<FloatingPipLayout remoteSubscriber={makeRemoteSubscriber()} />);
    act(() => {
      tapSelfPip();
    });
    expect(screen.getByTestId('floating-pip-camera-switch')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(screen.queryByTestId('floating-pip-camera-switch')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('reveals the background effects button on tap when supported', () => {
    mockCameras([]);

    render(<FloatingPipLayout remoteSubscriber={makeRemoteSubscriber()} />);
    act(() => {
      tapSelfPip();
    });

    expect(screen.getByTestId('floating-pip-background-effects')).toBeInTheDocument();
  });
});
