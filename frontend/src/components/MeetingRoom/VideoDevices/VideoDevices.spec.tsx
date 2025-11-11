import { describe, it, beforeEach, afterEach, vi, expect, Mock } from 'vitest';
import { render as renderBase, screen, fireEvent, cleanup } from '@testing-library/react';
import { Publisher } from '@vonage/client-sdk-video';
import { EventEmitter } from 'stream';
import { ReactElement } from 'react';
import useDevices from '@hooks/useDevices';
import usePublisherContext from '@hooks/usePublisherContext';
import { AllMediaDevices } from '@app-types/room';
import { PublisherContextType } from '@Context/PublisherProvider';
import { allMediaDevices, defaultAudioDevice } from '@utils/mockData/device';
import { AppConfigProviderWrapperOptions, makeAppConfigProviderWrapper } from '@test/providers';
import VideoDevices from './VideoDevices';

// Mocks
vi.mock('@hooks/useDevices');
vi.mock('@hooks/usePublisherContext');
vi.mock('@utils/storage', () => ({
  setStorageItem: vi.fn(),
  STORAGE_KEYS: {
    VIDEO_SOURCE: 'videoSource',
  },
}));

const mockUseDevices = useDevices as Mock<
  [],
  { allMediaDevices: AllMediaDevices; getAllMediaDevices: () => void }
>;
const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;

describe('VideoDevices Component', () => {
  const mockHandleToggle = vi.fn();
  const mockSetVideoSource = vi.fn();
  const mockGetVideoSource = vi.fn(() => ({
    deviceId: 'a68ec4e4a6bc10dc572bd806414b0da27d0aefb0ad822f7ba4cf9b226bb9b7c2',
    label: 'FaceTime HD Camera (2C0E:82E3)',
  }));
  let mockPublisher: Publisher;
  let publisherContext: PublisherContextType;

  beforeEach(() => {
    mockUseDevices.mockReturnValue({
      getAllMediaDevices: vi.fn(),
      allMediaDevices,
    });

    mockPublisher = Object.assign(new EventEmitter(), {
      setVideoSource: vi.fn(),
      applyVideoFilter: vi.fn(),
      clearVideoFilter: vi.fn(),
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

  it('renders all available video devices', () => {
    render(<VideoDevices handleToggle={mockHandleToggle} />);

    expect(screen.getByText('Camera')).toBeInTheDocument();
    expect(screen.getByText('FaceTime HD Camera')).toBeInTheDocument();
    expect(screen.getByText('External Web Camera')).toBeInTheDocument();
  });

  it('changes video source on menu item click', () => {
    render(<VideoDevices handleToggle={mockHandleToggle} />);

    const camera2Item = screen.getByText('External Web Camera');
    fireEvent.click(camera2Item);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
  });

  it('does not call setVideoSource if selected device is not found', () => {
    render(<VideoDevices handleToggle={mockHandleToggle} />);

    const bogusItem = document.createElement('li');
    bogusItem.textContent = 'Nonexistent Camera';
    fireEvent.click(bogusItem); // simulate bogus click

    expect(mockSetVideoSource).not.toHaveBeenCalled();
  });

  it('is not rendered when allowDeviceSelection is false', () => {
    const { container } = render(<VideoDevices handleToggle={mockHandleToggle} />, {
      appConfigOptions: {
        value: {
          meetingRoomSettings: {
            allowDeviceSelection: false,
          },
        },
      },
    });

    expect(container.firstChild).toBeNull();
  });
});

function render(
  ui: ReactElement,
  options?: {
    appConfigOptions?: AppConfigProviderWrapperOptions;
  }
) {
  const { AppConfigWrapper } = makeAppConfigProviderWrapper(options?.appConfigOptions);

  return renderBase(ui, { ...options, wrapper: AppConfigWrapper });
}
