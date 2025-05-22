import { describe, it, beforeEach, afterEach, vi, expect, Mock } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { Publisher } from '@vonage/client-sdk-video';
import { EventEmitter } from 'stream';
import VideoDevicesOptions from './VideoDevicesOptions';
import usePublisherContext from '../../../hooks/usePublisherContext';
import { PublisherContextType } from '../../../Context/PublisherProvider';
import { defaultAudioDevice } from '../../../utils/mockData/device';

// Mocks
vi.mock('../../../hooks/usePublisherContext');
vi.mock('../../../utils/storage', () => ({
  setStorageItem: vi.fn(),
  STORAGE_KEYS: {
    VIDEO_SOURCE: 'videoSource',
  },
}));
const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;

describe('VideoDevicesOptions Component', () => {
  const mockGetVideoSource = vi.fn(() => ({
    deviceId: 'a68ec4e4a6bc10dc572bd806414b0da27d0aefb0ad822f7ba4cf9b226bb9b7c2',
    label: 'FaceTime HD Camera (2C0E:82E3)',
  }));
  let mockPublisher: Publisher;
  let publisherContext: PublisherContextType;
  const applyVideoFilter = vi.fn(() => true);
  const clearVideoFilter = vi.fn();

  beforeEach(() => {
    mockPublisher = Object.assign(new EventEmitter(), {
      getVideoFilter: vi.fn(() => ({ type: 'backgroundBlur' })),
      setVideoSource: vi.fn(),
      applyVideoFilter,
      clearVideoFilter,
      getAudioSource: () => defaultAudioDevice,
      getVideoSource: () => mockGetVideoSource(),
      videoWidth: () => 1280,
      videoHeight: () => 720,
    }) as unknown as Publisher;
    publisherContext = {
      publisher: mockPublisher,
      isPublishing: true,
      publish: vi.fn() as () => Promise<void>,
      initializeLocalPublisher: vi.fn(() => {
        publisherContext.publisher = mockPublisher;
      }) as unknown as () => void,
    } as unknown as PublisherContextType;
    mockUsePublisherContext.mockImplementation(() => publisherContext);

    mockGetVideoSource.mockReturnValue({
      deviceId: 'a68ec4e4a6bc10dc572bd806414b0da27d0aefb0ad822f7ba4cf9b226bb9b7c2',
      label: 'FaceTime HD Camera (2C0E:82E3)',
    });
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('renders blur option and toggle icons', () => {
    render(<VideoDevicesOptions customLightBlueColor="#00f" />);

    expect(screen.getByTestId('blur-text')).toHaveTextContent('Blur your background');
    expect(screen.getByTestId('toggle-off-icon')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-on-icon')).toBeInTheDocument();
  });

  it('calls applyVideoFilter and sets storage when toggled on', async () => {
    render(<VideoDevicesOptions customLightBlueColor="#00f" />);

    const toggleButton = screen.getByLabelText('Toggle background blur');
    fireEvent.click(toggleButton);

    // Call clearVideoFilter
    await waitFor(() => {
      expect(clearVideoFilter).toHaveBeenCalled();
    });

    fireEvent.click(toggleButton);

    // Call applyVideoFilter
    await waitFor(() => {
      expect(applyVideoFilter).toHaveBeenCalledWith({
        type: 'backgroundBlur',
        blurStrength: 'high',
      });
    });
  });
});
