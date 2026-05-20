import { describe, it, beforeEach, vi, expect } from 'vitest';
import { render as renderBase, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import { env } from '../../../env';
import {
  makeMediaDeviceInfos,
  makeMediaStreamMock,
  setupWindowNavigatorMock,
} from '@web-test/fixtures';
import { Publisher } from '@vonage/client-sdk-video';
import EventEmitter from 'events';
import { mediaDevices$ } from '@core/stores';
import InputAudioDevices from './InputAudioDevices';

const devices = makeMediaDeviceInfos();
const mockHandleToggle = vi.fn();
const mockSetAudioSource = vi.fn();
const mockGetAudioSource = vi.fn();

// Create a default audio device matching the fixture
const defaultAudioDevice = devices.find((d) => d.kind === 'audioinput')!;

describe('InputAudioDevices Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    env.partialUpdate({
      MEETING_ROOM_ALLOW_DEVICE_SELECTION: true,
    });

    // Mock the native devices API - must be in beforeEach because vi.restoreAllMocks() clears them
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn().mockReturnValue(true),
        enumerateDevices: Promise.resolve(devices),
        getUserMedia: Promise.resolve(
          makeMediaStreamMock({
            getTracks: [],
            getVideoTracks: [],
            getAudioTracks: [],
          })
        ),
      },
    });

    mockGetAudioSource.mockReturnValue(defaultAudioDevice);

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
    const selectDeviceSpy = vi.spyOn(mediaDevices$.actions, 'selectDevice');

    render(<InputAudioDevices handleToggle={mockHandleToggle} />);

    const micItem = screen.getByText('External Microphone');
    fireEvent.click(micItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(selectDeviceSpy).toHaveBeenCalledWith('audioinput', 'audio-input-3');

    await waitFor(() => {
      expect(mediaDevices$.getState().audioinput === 'audio-input-3').toBeTruthy();
    });
  });

  it('does not call selectDevice if selected device is not found', () => {
    const selectDeviceSpy = vi.spyOn(mediaDevices$.actions, 'selectDevice');

    render(<InputAudioDevices handleToggle={mockHandleToggle} />);

    // Clear any calls from initial render/sync
    selectDeviceSpy.mockClear();

    const bogusItem = document.createElement('li');
    bogusItem.textContent = 'Nonexistent Microphone';
    fireEvent.click(bogusItem);

    expect(selectDeviceSpy).not.toHaveBeenCalled();
  });

  it('selects device even if publisher is not available', async () => {
    const selectDeviceSpy = vi.spyOn(mediaDevices$.actions, 'selectDevice');

    render(<InputAudioDevices handleToggle={mockHandleToggle} />, {
      publisherContext: {
        initialValue: {
          publisher: null,
          isPublishing: false,
        },
      },
    });

    const micItem = screen.getByText('External Microphone');
    fireEvent.click(micItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    // Device selection happens in the store regardless of publisher availability
    // useSyncPublisherDevices will sync when publisher becomes available
    expect(selectDeviceSpy).toHaveBeenCalledWith('audioinput', 'audio-input-3');

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
    env.partialUpdate({
      MEETING_ROOM_ALLOW_DEVICE_SELECTION: false,
    });

    render(<InputAudioDevices handleToggle={mockHandleToggle} />);

    expect(screen.queryByText('Microphone')).not.toBeInTheDocument();
  });

  it('handles click event when audioDeviceId is found', async () => {
    const selectDeviceSpy = vi.spyOn(mediaDevices$.actions, 'selectDevice');

    render(<InputAudioDevices handleToggle={mockHandleToggle} />);

    const micItem = screen.getByText('USB Headset Microphone');
    fireEvent.click(micItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(selectDeviceSpy).toHaveBeenCalledWith('audioinput', 'audio-input-2');

    // Wait for the actual state change to complete
    await waitFor(() => {
      expect(mediaDevices$.getState().audioinput === 'audio-input-2').toBeTruthy();
    });
  });
});

function render(
  ui: ReactElement,
  {
    userContext,
    sessionContext,
    publisherContext,
  }: {
    userContext?: ProviderOptions['UserContext'];
    sessionContext?: ProviderOptions['SessionContext'];
    publisherContext?: ProviderOptions['PublisherContext'];
  } = {}
) {
  const mockPublisher = Object.assign(new EventEmitter(), {
    setAudioSource: mockSetAudioSource,
    getAudioSource: mockGetAudioSource,
    setVideoSource: vi.fn(),
    getVideoSource: vi.fn(),
    setPreferredFrameRate: vi.fn().mockResolvedValue(undefined),
    setPreferredResolution: vi.fn().mockResolvedValue(undefined),
    setMaxVideoBitrate: vi.fn().mockResolvedValue(undefined),
    setVideoBitratePreset: vi.fn().mockResolvedValue(undefined),
  }) as unknown as Publisher;

  const { wrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.publisher, providers.runtime],
    {
      userContext,
      sessionContext,
      publisherContext: {
        initialValue: {
          publisher: mockPublisher,
          isPublishing: true,
          ...publisherContext?.initialValue,
        },
      },
      runtimeContext: undefined,
    }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
