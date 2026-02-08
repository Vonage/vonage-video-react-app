import { describe, it, beforeEach, vi, expect } from 'vitest';
import { render as renderBase, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import { makeTestProvider, providers } from '@test/providers';
import type { PublisherProviderWrapperOptions } from '@test/providers';
import makeMediaDeviceInfos from '@common-test/fixtures/makeMediaDeviceInfos';
import type MediaDevices$ from '@core/stores/devices';
import type InputAudioDevicesType from './InputAudioDevices';
import { Publisher } from '@vonage/client-sdk-video';
import EventEmitter from 'events';

const devices = makeMediaDeviceInfos();
const mockHandleToggle = vi.fn();
const mockSetAudioSource = vi.fn();
const mockGetAudioSource = vi.fn();

// Create a default audio device matching the fixture
const defaultAudioDevice = devices.find((d) => d.kind === 'audioinput')!;

describe('InputAudioDevices Component', () => {
  let InputAudioDevices: typeof InputAudioDevicesType;
  let mediaDevices$: typeof MediaDevices$;

  beforeEach(async () => {
    // Mock the native devices API - must be in beforeEach because vi.restoreAllMocks() clears them
    vi.spyOn(globalThis.navigator.mediaDevices, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(globalThis.navigator.mediaDevices, 'removeEventListener').mockImplementation(() => {});
    vi.spyOn(globalThis.navigator.mediaDevices, 'dispatchEvent').mockReturnValue(true);
    vi.spyOn(globalThis.navigator.mediaDevices, 'enumerateDevices').mockResolvedValue(devices);
    vi.spyOn(globalThis.navigator.mediaDevices, 'getUserMedia').mockResolvedValue({
      getVideoTracks: () => [],
      getAudioTracks: () => [],
      getTracks: () => [],
    } as unknown as MediaStream);

    mockGetAudioSource.mockReturnValue(defaultAudioDevice);

    ({ InputAudioDevices, mediaDevices$ } = await importInputAudioDevices());

    // Initialize the mediaDevices$ store with the fixture devices
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: devices,
    }));
  });

  it('renders all available audio input devices', () => {
    render(<InputAudioDevices handleToggle={mockHandleToggle} />);

    expect(screen.getByText('Microphone')).toBeInTheDocument();

    // Check that specific audio input devices are rendered
    expect(screen.getByText('Default Microphone')).toBeInTheDocument();
    expect(screen.getByText('USB Headset Microphone')).toBeInTheDocument();
    expect(screen.getByText('External Microphone')).toBeInTheDocument();
  });

  it('changes audio input device on menu item click', async () => {
    render(<InputAudioDevices handleToggle={mockHandleToggle} />);

    const micItem = screen.getByText('External Microphone');
    fireEvent.click(micItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(mockSetAudioSource).toHaveBeenCalledWith('audio-input-3');

    await waitFor(() => {
      expect(mediaDevices$.getState().audioinput === 'audio-input-3').toBeTruthy();
    });
  });

  it('does not call setAudioSource if selected device is not found', async () => {
    render(<InputAudioDevices handleToggle={mockHandleToggle} />);

    const bogusItem = document.createElement('li');
    bogusItem.textContent = 'Nonexistent Microphone';
    fireEvent.click(bogusItem);

    expect(mockSetAudioSource).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(mediaDevices$.getState().audioinput === 'audio-input-3').toBeTruthy();
    });
  });

  it('does not call setAudioSource if publisher is not available', async () => {
    render(<InputAudioDevices handleToggle={mockHandleToggle} />, {
      publisherContext: {
        initialValue: {
          publisherContext: null,
          isPublishing: false,
        },
      },
    });

    const micItem = screen.getByText('External Microphone');
    fireEvent.click(micItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(mockSetAudioSource).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(mediaDevices$.getState().audioinput === 'audio-input-3').toBeTruthy();
    });
  });

  it('shows check icon for selected device', () => {
    render(<InputAudioDevices handleToggle={mockHandleToggle} />);

    // The default audio device should be selected
    const checkIcon = screen.getByTestId('vivid-icon-check-line');
    expect(checkIcon).toBeInTheDocument();
  });

  it('is not rendered when allowDeviceSelection is false', () => {
    render(<InputAudioDevices handleToggle={mockHandleToggle} />, {
      appConfigContext: {
        value: {
          meetingRoomSettings: {
            allowDeviceSelection: false,
          },
        },
      },
    });

    expect(screen.queryByText('Microphone')).not.toBeInTheDocument();
  });

  it('handles click event when audioDeviceId is found', async () => {
    render(<InputAudioDevices handleToggle={mockHandleToggle} />);

    const micItem = screen.getByText('USB Headset Microphone');
    fireEvent.click(micItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(mockSetAudioSource).toHaveBeenCalledWith('audio-input-2');

    // Wait for the actual state change to complete
    await waitFor(() => {
      expect(mediaDevices$.getState().audioinput === 'audio-input-2').toBeTruthy();
    });
  });
});

function render(
  ui: ReactElement,
  options: {
    publisherOptions?: PublisherProviderWrapperOptions;
    appConfigOptions?: { meetingRoomSettings?: any };
  } = {}
) {
  const mockPublisher = Object.assign(new EventEmitter(), {
    setAudioSource: mockSetAudioSource,
    getAudioSource: mockGetAudioSource,
    setVideoSource: vi.fn(),
    getVideoSource: vi.fn(),
  }) as unknown as Publisher;

  const { wrapper, ...context } = makeTestProvider(
    [providers.AppConfig, providers.User, providers.Session, providers.Publisher],
    {
      ...options,
      publisherContext: {
        initialValue: {
          publisherContext: mockPublisher,
          isPublishing: true,
          ...options.publisherOptions?.initialValue,
        },
      },
    }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}

async function importInputAudioDevices() {
  const mediaDevices$ = (await import('@core/stores/devices')).default;

  const InputAudioDevices = (
    await vi.importActual<typeof import('./InputAudioDevices')>('./InputAudioDevices')
  ).default;

  return { InputAudioDevices, mediaDevices$ };
}
