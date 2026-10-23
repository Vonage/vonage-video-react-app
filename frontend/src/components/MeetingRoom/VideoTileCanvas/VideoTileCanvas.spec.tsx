import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import type { Subscriber as OTSubscriber } from '@vonage/client-sdk-video';
import useSessionContext from '@hooks/useSessionContext';
import type { SessionContextType } from '@Context/SessionProvider/session';
import type { SubscriberWrapper } from '@app-types/session';
import sortByDisplayPriority from '../../../utils/sessionStateOperations/sortByDisplayPriority';
import VideoTileCanvas from './VideoTileCanvas';

const mockScreenSharePublisher = vi.fn((_props: unknown) => <div>Mock ScreenSharePublisher</div>);

vi.mock('../ScreenSharePublisher/ScreenSharePublisher', () => ({
  default: (props: unknown) => mockScreenSharePublisher(props),
}));

vi.mock('@hooks/useSessionContext');

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

beforeEach(() => {
  mockScreenSharePublisher.mockClear();
  mockUseSessionContext.mockReturnValue({
    connected: true,
    reconnecting: false,
    subscriberWrappers: [],
    activeSpeakerId: undefined,
    layoutMode: 'grid',
    isMaxPinned: false,
    pinSubscriber: vi.fn(),
  } as unknown as SessionContextType);
});

const createSubscriberWrapper = (id: string, isPinned = false): SubscriberWrapper => ({
  id,
  element: document.createElement('video'),
  isScreenshare: false,
  isPinned,
  subscriber: {
    on: vi.fn(),
    off: vi.fn(),
    videoWidth: () => 1280,
    videoHeight: () => 720,
    subscribeToVideo: () => {},
    getVideoFilter: vi.fn(() => undefined),
    stream: { streamId: id, videoType: 'camera', name: id },
  } as unknown as OTSubscriber,
});

const renderCanvas = () =>
  render(
    <VideoTileCanvas
      isSharingScreen={false}
      isEntireScreen={false}
      screensharingPublisher={null}
      screenshareVideoElement={undefined}
      isRightPanelOpen={false}
    />
  );

describe('VideoTileCanvas', () => {
  it('renders without crashing', () => {
    const { container } = renderCanvas();

    expect(container).toBeDefined();
  });

  it('passes isEntireScreen=true to ScreenSharePublisher', () => {
    render(
      <VideoTileCanvas
        isSharingScreen={true}
        isEntireScreen={true}
        screensharingPublisher={{} as unknown as never}
        screenshareVideoElement={undefined}
        isRightPanelOpen={false}
      />
    );

    expect(mockScreenSharePublisher).toHaveBeenCalled();

    const props = mockScreenSharePublisher.mock.calls[0][0] as {
      isEntireScreen: boolean;
    };

    expect(props.isEntireScreen).toBe(true);
  });

  it('keeps a pinned subscriber visible, then shows the promoted active speaker alongside it, among 15 participants', () => {
    const subscribers = Array.from({ length: 15 }, (_, index) =>
      createSubscriberWrapper(`sub${index + 1}`)
    );
    subscribers[13] = { ...subscribers[13], isPinned: true };

    mockUseSessionContext.mockReturnValue({
      connected: true,
      reconnecting: false,
      subscriberWrappers: subscribers.toSorted(sortByDisplayPriority(undefined)),
      activeSpeakerId: undefined,
      layoutMode: 'active-speaker',
      isMaxPinned: false,
      pinSubscriber: vi.fn(),
    } as unknown as SessionContextType);

    const { rerender } = renderCanvas();

    expect(screen.getByTestId('subscriber-container-sub14')).toBeVisible();

    mockUseSessionContext.mockReturnValue({
      connected: true,
      reconnecting: false,
      subscriberWrappers: subscribers.toSorted(sortByDisplayPriority('sub10')),
      activeSpeakerId: 'sub10',
      layoutMode: 'active-speaker',
      isMaxPinned: false,
      pinSubscriber: vi.fn(),
    } as unknown as SessionContextType);

    rerender(
      <VideoTileCanvas
        isSharingScreen={false}
        isEntireScreen={false}
        screensharingPublisher={null}
        screenshareVideoElement={undefined}
        isRightPanelOpen={false}
      />
    );

    expect(screen.getByTestId('subscriber-container-sub14')).toBeVisible();
    expect(screen.getByTestId('subscriber-container-sub10')).toBeVisible();
  });
});
