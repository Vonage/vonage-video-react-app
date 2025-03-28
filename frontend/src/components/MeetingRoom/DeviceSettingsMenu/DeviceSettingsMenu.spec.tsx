import { act, queryByText, render, screen, waitFor } from '@testing-library/react';
import { describe, beforeEach, it, Mock, vi, expect, afterAll } from 'vitest';
import { MutableRefObject } from 'react';
import { EventEmitter } from 'stream';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import * as util from '../../../utils/util';
import DeviceSettingsMenu from './DeviceSettingsMenu';
import { AudioOutputProvider } from '../../../Context/AudioOutputProvider';
import {
  audioInputDevices,
  audioOutputDevices,
  nativeDevices,
  videoInputDevices,
} from '../../../utils/mockData/device';

const {
  mockHasMediaProcessorSupport,
  mockGetDevices,
  mockGetAudioOutputDevices,
  mockSetAudioOutputDevice,
  mockGetActiveAudioOutputDevice,
} = vi.hoisted(() => {
  return {
    mockGetDevices: vi.fn(),
    mockGetAudioOutputDevices: vi.fn(),
    mockSetAudioOutputDevice: vi.fn(),
    mockHasMediaProcessorSupport: vi.fn().mockReturnValue(true),
    mockGetActiveAudioOutputDevice: vi.fn(),
  };
});
vi.mock('@vonage/client-sdk-video', () => ({
  getActiveAudioOutputDevice: mockGetActiveAudioOutputDevice,
  getAudioOutputDevices: mockGetAudioOutputDevices,
  getDevices: mockGetDevices,
  hasMediaProcessorSupport: mockHasMediaProcessorSupport,
  setAudioOutputDevice: mockSetAudioOutputDevice,
}));

vi.mock('../../../utils/util', async () => {
  const actual = await vi.importActual<typeof import('../../../utils/util')>('../../../utils/util');
  return {
    ...actual,
    isGetActiveAudioOutputDeviceSupported: vi.fn(),
  };
});

// This is returned by Vonage SDK if audioOutput is not supported
const vonageDefaultEmptyOutputDevice = { deviceId: null, label: null };

describe('DeviceSettingsMenu Component', () => {
  const nativeMediaDevices = global.navigator.mediaDevices;
  const mockHandleToggle = vi.fn();
  const mockSetIsOpen = vi.fn();
  const mockAnchorRef = {
    current: document.createElement('input'),
  } as MutableRefObject<HTMLInputElement>;
  const mockHandleClose = vi.fn();
  let deviceChangeListener: EventEmitter;
  const mockedHasMediaProcessorSupport = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    mockGetDevices.mockImplementation((cb) =>
      cb(null, [...audioInputDevices, ...videoInputDevices])
    );
    mockGetActiveAudioOutputDevice.mockResolvedValue(audioOutputDevices[0]);
    mockGetAudioOutputDevices.mockResolvedValue(audioOutputDevices);
    deviceChangeListener = new EventEmitter();
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: vi.fn(
          () =>
            new Promise<MediaDeviceInfo[]>((res) => {
              res(nativeDevices as MediaDeviceInfo[]);
            })
        ),
        addEventListener: vi.fn((event, listener) => deviceChangeListener.on(event, listener)),
        removeEventListener: vi.fn((event, listener) => deviceChangeListener.off(event, listener)),
      },
    });
    (hasMediaProcessorSupport as Mock).mockImplementation(mockedHasMediaProcessorSupport);
    mockedHasMediaProcessorSupport.mockReturnValue(false);
  });

  afterAll(() => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: nativeMediaDevices,
    });
  });

  describe('renders the audio settings menu', () => {
    it('and renders the output devices if the browser supports setting audioOutput device', async () => {
      (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(true);

      render(
        <AudioOutputProvider>
          <DeviceSettingsMenu
            isAudioControl
            handleToggle={mockHandleToggle}
            isOpen
            anchorRef={mockAnchorRef}
            handleClose={mockHandleClose}
            setIsOpen={mockSetIsOpen}
          />
        </AudioOutputProvider>
      );

      const outputDevicesElement = screen.getByTestId('output-devices');
      await waitFor(() => expect(outputDevicesElement.children).to.have.length(3));
      expect(outputDevicesElement.firstChild).toHaveTextContent('System Default');
      expect((outputDevicesElement.firstChild as HTMLOptionElement).selected).toBe(true);
      expect(outputDevicesElement.children[1]).toHaveTextContent(
        'Soundcore Life A2 NC (Bluetooth)'
      );
      expect(outputDevicesElement.children[2]).toHaveTextContent('MacBook Pro Speakers (Built-in)');

      await act(() => (outputDevicesElement.children[2] as HTMLOptionElement).click?.());

      expect(mockSetAudioOutputDevice).toHaveBeenCalledWith(audioOutputDevices[2].deviceId);
      await expect((outputDevicesElement.children[2] as HTMLOptionElement).selected).toBe(true);
    });

    it('and renders the default output device if the browser does not support setting audioOutput device', async () => {
      (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(false);
      mockGetAudioOutputDevices.mockResolvedValue([vonageDefaultEmptyOutputDevice]);
      render(
        <AudioOutputProvider>
          <DeviceSettingsMenu
            isAudioControl
            handleToggle={mockHandleToggle}
            isOpen
            anchorRef={mockAnchorRef}
            handleClose={mockHandleClose}
            setIsOpen={mockSetIsOpen}
          />
        </AudioOutputProvider>
      );

      const outputDevicesElement = screen.getByTestId('output-devices');
      await waitFor(() => expect(outputDevicesElement.children).to.have.length(1));
      expect(outputDevicesElement.firstChild).toHaveTextContent('System Default');
      expect((outputDevicesElement.firstChild as HTMLOptionElement).selected).toBe(true);

      await act(() => (outputDevicesElement.firstChild as HTMLOptionElement).click?.());

      expect(mockSetAudioOutputDevice).not.toHaveBeenCalled();
      await expect((outputDevicesElement.firstChild as HTMLOptionElement).selected).toBe(true);
    });

    it('and renders the speaker test if the browser supports audio output device selection', async () => {
      (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(true);

      await act(() =>
        render(
          <AudioOutputProvider>
            <DeviceSettingsMenu
              isAudioControl
              handleToggle={mockHandleToggle}
              isOpen
              anchorRef={mockAnchorRef}
              handleClose={mockHandleClose}
              setIsOpen={mockSetIsOpen}
            />
          </AudioOutputProvider>
        )
      );

      const outputDevicesElement = screen.getByTestId('output-devices');
      expect(outputDevicesElement).toBeInTheDocument();
    });

    it('and renders the speaker test devices if the browser does not support audio output device selection', async () => {
      (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(false);
      mockGetAudioOutputDevices.mockResolvedValue([vonageDefaultEmptyOutputDevice]);

      await act(() =>
        render(
          <AudioOutputProvider>
            <DeviceSettingsMenu
              isAudioControl
              handleToggle={mockHandleToggle}
              isOpen
              anchorRef={mockAnchorRef}
              handleClose={mockHandleClose}
              setIsOpen={mockSetIsOpen}
            />
          </AudioOutputProvider>
        )
      );

      const soundTest = screen.queryByTestId('soundTest');
      expect(soundTest).toBeInTheDocument();
    });

    it('and updates audio output device list if device is removed', async () => {
      (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(true);

      render(
        <AudioOutputProvider>
          <DeviceSettingsMenu
            isAudioControl
            handleToggle={mockHandleToggle}
            isOpen
            anchorRef={mockAnchorRef}
            handleClose={mockHandleClose}
            setIsOpen={mockSetIsOpen}
          />
        </AudioOutputProvider>
      );

      const outputDevicesElement = screen.getByTestId('output-devices');

      // Check initial list is correct
      await waitFor(() => expect(outputDevicesElement.children).to.have.length(3));
      expect(outputDevicesElement.firstChild).toHaveTextContent('System Default');
      expect((outputDevicesElement.firstChild as HTMLOptionElement).selected).toBe(true);
      expect(outputDevicesElement.children[1]).toHaveTextContent(
        'Soundcore Life A2 NC (Bluetooth)'
      );
      expect(outputDevicesElement.children[2]).toHaveTextContent('MacBook Pro Speakers (Built-in)');

      // select device 2
      await act(() => (outputDevicesElement.children[1] as HTMLOptionElement).click?.());
      expect(mockSetAudioOutputDevice).toHaveBeenCalledWith(audioOutputDevices[1].deviceId);
      await expect((outputDevicesElement.children[1] as HTMLOptionElement).selected).toBe(true);

      // Simulate device 2 removal
      mockGetActiveAudioOutputDevice.mockResolvedValue(audioOutputDevices[0]);
      mockGetAudioOutputDevices.mockResolvedValue([audioOutputDevices[0], audioOutputDevices[2]]);
      mockGetActiveAudioOutputDevice.mockResolvedValue(audioOutputDevices[0]);
      await act(() => deviceChangeListener.emit('devicechange'));
      await waitFor(() => expect(outputDevicesElement.children).to.have.length(2));
      expect(outputDevicesElement.firstChild).toHaveTextContent('System Default');
      expect((outputDevicesElement.firstChild as HTMLOptionElement).selected).toBe(true);
      expect(outputDevicesElement.children[1]).toHaveTextContent('MacBook Pro Speakers (Built-in)');
      const removedDevice = queryByText(outputDevicesElement, 'Soundcore Life A2 NC (Bluetooth)');
      expect(removedDevice).not.toBeInTheDocument();
    });
  });

  describe('renders the video settings menu', () => {
    it('if prompted', () => {
      render(
        <DeviceSettingsMenu
          handleToggle={mockHandleToggle}
          handleClose={mockHandleClose}
          isOpen
          anchorRef={mockAnchorRef}
          setIsOpen={mockSetIsOpen}
        />
      );
      expect(screen.queryByTestId('video-settings-devices-dropdown')).toBeInTheDocument();
    });

    it('but does not render it if closed', () => {
      render(
        <DeviceSettingsMenu
          handleToggle={mockHandleToggle}
          handleClose={mockHandleClose}
          isOpen={false}
          anchorRef={mockAnchorRef}
          setIsOpen={mockSetIsOpen}
        />
      );
      expect(screen.queryByTestId('video-settings-devices-dropdown')).not.toBeInTheDocument();
    });

    it('and renders the dropdown separator and background blur option when media processor is supported', () => {
      mockedHasMediaProcessorSupport.mockReturnValue(true);
      render(
        <DeviceSettingsMenu
          handleToggle={mockHandleToggle}
          handleClose={mockHandleClose}
          isOpen
          anchorRef={mockAnchorRef}
          setIsOpen={mockSetIsOpen}
        />
      );
      expect(screen.queryByTestId('dropdown-separator')).toBeVisible();
      expect(screen.queryByText('Blur your background')).toBeVisible();
    });

    it('and does not render the dropdown separator and background blur option when media processor is not supported', () => {
      render(
        <DeviceSettingsMenu
          handleToggle={mockHandleToggle}
          handleClose={mockHandleClose}
          isOpen
          anchorRef={mockAnchorRef}
          setIsOpen={mockSetIsOpen}
        />
      );
      expect(screen.queryByTestId('dropdown-separator')).not.toBeInTheDocument();
      expect(screen.queryByText('Blur your background')).not.toBeInTheDocument();
    });
  });
});
