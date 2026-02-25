import {
  makeMediaDeviceInfos,
  makeMediaStreamMock,
  mockPlatformModule,
  setupWindowNavigatorMock,
} from '@web-test/fixtures';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import { render as renderBase, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import type { MediaDeviceInfoJSON } from '@web/types';
import { makeTestProvider } from '@test/providers';
import { isSinkIdSupported } from '@web/platform';
import mediaDevices$ from '@core/stores/devices';
import { env } from '../../../env';
import OutputAudioDevices from './OutputAudioDevices';

vi.mock('@web/platform', async () => {
  const actual = await vi.importActual('@web/platform');

  return mockPlatformModule(actual, {
    isSinkIdSupported: true,
  });
});

const someDevices = makeMediaDeviceInfos();

describe('OutputAudioDevices Component', () => {
  const mockHandleToggle = vi.fn();

  let defaultSpeakers: MediaDeviceInfoJSON;
  let usbHeadsetSpeakers: MediaDeviceInfoJSON;
  let bluetoothSpeakers: MediaDeviceInfoJSON;

  beforeEach(() => {
    mediaDevices$.reset();
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: someDevices,
    }));

    const audioOutputDevices = Object.values(mediaDevices$.mediaDevicesMap$.getState().audiooutput);
    [defaultSpeakers, usbHeadsetSpeakers, bluetoothSpeakers] = audioOutputDevices;

    // after initializing the store to avoid having to mock all the mediaDevices$ sync logic.
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(someDevices),
        getUserMedia: Promise.resolve(
          makeMediaStreamMock({
            getVideoTracks: [],
            getAudioTracks: [],
          })
        ),
      },
    });
  });

  it('renders all available audio output devices when supported', () => {
    render(<OutputAudioDevices handleToggle={mockHandleToggle} />);

    expect(screen.getByText('Speakers')).toBeInTheDocument();
    expect(screen.getByTestId('output-devices')).toBeInTheDocument();

    // Check that specific audio output devices are rendered
    expect(screen.getByText(defaultSpeakers.label)).toBeInTheDocument();
    expect(screen.getByText(usbHeadsetSpeakers.label)).toBeInTheDocument();
    expect(screen.getByText(bluetoothSpeakers.label)).toBeInTheDocument();
  });

  it('renders only default device when audio output is not supported', () => {
    //  Mock isSinkIdSupported to return false
    vi.mocked(isSinkIdSupported).mockReturnValue(false);

    render(<OutputAudioDevices handleToggle={mockHandleToggle} />);

    expect(screen.getByText('Speakers')).toBeInTheDocument();
    expect(screen.getByText('System Default')).toBeInTheDocument();

    // Should not render the actual audio output devices
    expect(screen.queryByText(defaultSpeakers.label)).not.toBeInTheDocument();
  });

  it('changes audio output device on menu item click when supported', async () => {
    const selectDeviceSpy = vi.spyOn(mediaDevices$.actions, 'selectDevice');

    render(<OutputAudioDevices handleToggle={mockHandleToggle} />);

    const speakerItem = screen.getByText(usbHeadsetSpeakers.label);
    fireEvent.click(speakerItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(selectDeviceSpy).toHaveBeenCalledWith('audiooutput', usbHeadsetSpeakers.deviceId);

    await waitFor(() => {
      expect(mediaDevices$.getState().audiooutput === usbHeadsetSpeakers.deviceId).toBeTruthy();
    });
  });

  it('does not call selectDevice when audio output is not supported', () => {
    vi.mocked(isSinkIdSupported).mockReturnValue(false);

    const selectDeviceSpy = vi.spyOn(mediaDevices$.actions, 'selectDevice');

    render(<OutputAudioDevices handleToggle={mockHandleToggle} />);

    const defaultItem = screen.getByText('System Default');
    fireEvent.click(defaultItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(selectDeviceSpy).not.toHaveBeenCalled();
  });

  it('shows selection state based on store', () => {
    // Without selecting a device in the store, no device should be marked as selected
    render(<OutputAudioDevices handleToggle={mockHandleToggle} />);

    // All menu items should be rendered but none marked as selected (no Mui-selected class)
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(3);

    // None should have the selected class since currentAudioOutputId is null
    menuItems.forEach((item) => {
      expect(item).not.toHaveClass('Mui-selected');
    });
  });

  it('shows check icon for default device when only one device available', () => {
    vi.mocked(isSinkIdSupported).mockReturnValue(false);

    render(<OutputAudioDevices handleToggle={mockHandleToggle} />);

    // When only default device is available (length === 1), it should be selected.
    const checkIcon = screen.getByTestId('vivid-icon-check-line');
    expect(checkIcon).toBeInTheDocument();
  });

  it('is not rendered when allowDeviceSelection is false', () => {
    env.partialUpdate({
      MEETING_ROOM_ALLOW_DEVICE_SELECTION: false,
    });

    render(<OutputAudioDevices handleToggle={mockHandleToggle} />);

    expect(screen.queryByTestId('output-device-title')).not.toBeInTheDocument();
    expect(screen.queryByTestId('output-devices')).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([]);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
