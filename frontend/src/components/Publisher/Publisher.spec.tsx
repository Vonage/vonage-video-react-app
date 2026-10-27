import { describe, it, expect, vi, afterEach, Mock } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Box } from 'opentok-layout-js';
import { PublisherContextType } from '@Context/PublisherProvider';
import usePublisherContext from '@hooks/usePublisherContext';
import Publisher from './Publisher';

vi.mock('@hooks/usePublisherContext.tsx');

const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;

const mockBox: Box = { height: 100, left: 0, top: 0, width: 100 };

const createPublisherContext = (
  overrides: Partial<PublisherContextType> = {}
): PublisherContextType =>
  ({
    publisherVideoElement: null,
    isVideoEnabled: true,
    isAudioEnabled: false,
    isPublishing: false,
    publisher: null,
    ...overrides,
  }) as unknown as PublisherContextType;

describe('Publisher', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders without a video element when none is provided', () => {
    mockUsePublisherContext.mockReturnValue(createPublisherContext());

    const { container } = render(<Publisher box={mockBox} />);

    expect(container.querySelector('video')).toBeNull();
  });

  it('attaches the publisher video element to the container', () => {
    const element = document.createElement('video');
    mockUsePublisherContext.mockReturnValue(
      createPublisherContext({ publisherVideoElement: element })
    );

    const { container } = render(<Publisher box={mockBox} />);

    expect(container.contains(element)).toBe(true);
  });

  it('replaces the previous video element, leaving only the replacement attached', () => {
    const firstElement = document.createElement('video');
    mockUsePublisherContext.mockReturnValue(
      createPublisherContext({ publisherVideoElement: firstElement })
    );

    const { container, rerender } = render(<Publisher box={mockBox} />);
    expect(container.contains(firstElement)).toBe(true);

    const secondElement = document.createElement('video');
    mockUsePublisherContext.mockReturnValue(
      createPublisherContext({ publisherVideoElement: secondElement })
    );
    rerender(<Publisher box={mockBox} />);

    expect(container.contains(firstElement)).toBe(false);
    expect(container.contains(secondElement)).toBe(true);
    expect(container.querySelectorAll('video')).toHaveLength(1);
  });

  it('detaches the video element on unmount', () => {
    const element = document.createElement('video');
    mockUsePublisherContext.mockReturnValue(
      createPublisherContext({ publisherVideoElement: element })
    );

    const { container, unmount } = render(<Publisher box={mockBox} />);
    expect(container.contains(element)).toBe(true);

    unmount();

    expect(container.contains(element)).toBe(false);
  });
});
