import { describe, it, beforeEach, afterEach, vi, expect, Mock } from 'vitest';
import { render as renderBase, screen, fireEvent, cleanup } from '@testing-library/react';
import { Publisher } from '@vonage/client-sdk-video';
import { EventEmitter } from 'stream';
import { ReactElement } from 'react';
import { AppConfigProviderWrapperOptions, makeAppConfigProviderWrapper } from '@test/providers';
import useDevices from '@hooks/useDevices';
import usePublisherContext from '@hooks/usePublisherContext';
import { AllMediaDevices } from '@app-types/room';
import { PublisherContextType } from '@Context/PublisherProvider';
import { allMediaDevices, defaultAudioDevice } from '@utils/mockData/device';
import InputDevices from './InputDevices';

// Mocks
vi.mock('@hooks/useDevices');
vi.mock('@hooks/usePublisherContext');
vi.mock('@utils/storage', () => ({
  setStorageItem: vi.fn(),
  STORAGE_KEYS: {
    AUDIO_SOURCE: 'audioSource',
  },
}));

const mockUseDevices = useDevices as Mock<
  [],
  { allMediaDevices: AllMediaDevices; getAllMediaDevices: () => void }
>;
const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;

describe('InputDevices Component', () => {
  const mockHandleToggle = vi.fn();
  const mockSetAudioSource = vi.fn();
  const mockGetAudioSource = vi.fn();
  let mockPublisher: Publisher;
  let publisherContext: PublisherContextType;

  beforeEach(() => {
    mockGetAudioSource.mockReturnValue(defaultAudioDevice);
    mockUseDevices.mockReturnValue({
      getAllMediaDevices: vi.fn(),
      allMediaDevices,
    });

    mockPublisher = Object.assign(new EventEmitter(), {
      setAudioSource: mockSetAudioSource,
      getAudioSource: mockGetAudioSource,
      setVideoSource: vi.fn(),
      getVideoSource: vi.fn(),
    }) as unknown as Publisher;

    publisherContext = {
      publisher: mockPublisher,
      isPublishing: true,
      publish: vi.fn() as () => Promise<void>,
      initializeLocalPublisher: vi.fn(),
    } as unknown as PublisherContextType;

    mockUsePublisherContext.mockImplementation(() => publisherContext);
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('renders all available audio input devices', () => {
    render(<InputDevices handleToggle={mockHandleToggle} />);

    expect(screen.getByText('Microphone')).toBeInTheDocument();

    // Check that specific audio input devices are rendered
    expect(screen.getByText('Default - Soundcore Life A2 NC (Bluetooth)')).toBeInTheDocument();
    expect(screen.getByText('Soundcore Life A2 NC (Bluetooth)')).toBeInTheDocument();
    expect(screen.getByText('MacBook Pro Microphone (Built-in)')).toBeInTheDocument();
  });

  it('changes audio input device on menu item click', () => {
    render(<InputDevices handleToggle={mockHandleToggle} />);

    const micItem = screen.getByText('MacBook Pro Microphone (Built-in)');
    fireEvent.click(micItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(mockSetAudioSource).toHaveBeenCalledWith(
      '68f1d1e6f11c629b1febe51a95f8f740f8ac5cd3d4c91419bd2b52bb1a9a01cd'
    );
  });

  it('does not call setAudioSource if selected device is not found', () => {
    render(<InputDevices handleToggle={mockHandleToggle} />);

    const bogusItem = document.createElement('li');
    bogusItem.textContent = 'Nonexistent Microphone';
    fireEvent.click(bogusItem);

    expect(mockSetAudioSource).not.toHaveBeenCalled();
  });

  it('does not call setAudioSource if publisher is not available', () => {
    publisherContext.publisher = null;
    mockUsePublisherContext.mockReturnValue(publisherContext);

    render(<InputDevices handleToggle={mockHandleToggle} />);

    const micItem = screen.getByText('MacBook Pro Microphone (Built-in)');
    fireEvent.click(micItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(mockSetAudioSource).not.toHaveBeenCalled();
  });

  it('shows check icon for selected device', () => {
    render(<InputDevices handleToggle={mockHandleToggle} />);

    // The default audio device should be selected
    const checkIcon = screen.getByTestId('CheckIcon');
    expect(checkIcon).toBeInTheDocument();
  });

  it('is not rendered when allowDeviceSelection is false', () => {
    render(<InputDevices handleToggle={mockHandleToggle} />, {
      appConfigOptions: {
        value: {
          meetingRoomSettings: {
            allowDeviceSelection: false,
          },
        },
      },
    });

    expect(screen.queryByText('Microphone')).not.toBeInTheDocument();
  });

  it('handles click event when audioDeviceId is found', () => {
    render(<InputDevices handleToggle={mockHandleToggle} />);

    const micItem = screen.getByText('Soundcore Life A2 NC (Bluetooth)');
    fireEvent.click(micItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(mockSetAudioSource).toHaveBeenCalledWith(
      'd59e9898546591e31374d2eb459566649abe47fd461625da72d0cf75f43dc36f'
    );
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
