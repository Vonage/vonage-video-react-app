import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VideoTileCanvas from './VideoTileCanvas';

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
});
