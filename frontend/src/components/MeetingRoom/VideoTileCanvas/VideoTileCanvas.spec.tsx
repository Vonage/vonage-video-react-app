import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VideoTileCanvas from './VideoTileCanvas';

const mockScreenSharePublisher = vi.fn((_props: unknown) => <div>Mock ScreenSharePublisher</div>);

vi.mock('../ScreenSharePublisher/ScreenSharePublisher', () => ({
  default: (props: unknown) => mockScreenSharePublisher(props),
}));

beforeEach(() => {
  mockScreenSharePublisher.mockClear();
});

describe('VideoTileCanvas', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <VideoTileCanvas
        isSharingScreen={false}
        isEntireScreen={false}
        screensharingPublisher={null}
        screenshareVideoElement={undefined}
        isRightPanelOpen={false}
      />
    );

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
});
