import {
  act,
  fireEvent,
  queryByText,
  screen,
  waitFor,
  render as renderBase,
} from '@testing-library/react';
import { describe, beforeEach, it, Mock, vi, expect } from 'vitest';
import { ReactElement, RefObject } from 'react';
import { EventEmitter } from 'node:stream';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import * as util from '@utils/util';
import {
  audioInputDevices,
  audioOutputDevices,
  nativeDevices,
  videoInputDevices,
} from '@utils/mockData/device';
import {
  AppConfigProviderWrapperOptions,
  AudioOutputProviderWrapperOptions,
  makeAppConfigProviderWrapper,
  makeAudioOutputProviderWrapper,
} from '@test/providers';
import composeProviders from '@utils/composeProviders';
import DeviceSettingsMenu from './DeviceSettingsMenu';
import mediaDevicesMock from '@common/test/mocks/mediaDevicesMock';

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

vi.mock('@utils/util', async () => {
  const actual = await vi.importActual<typeof import('@utils/util')>('@utils/util');
  return {
    ...actual,
    isGetActiveAudioOutputDeviceSupported: vi.fn(),
  };
});

// This is returned by Vonage SDK if audioOutput is not supported
const vonageDefaultEmptyOutputDevice = { deviceId: null, label: null };

describe('DeviceSettingsMenu Component', () => {
  const mockHandleToggle = vi.fn();
  const mockHandleToggleBackgroundEffects = vi.fn();
  const mockSetIsOpen = vi.fn();
  const mockAnchorRef = {
    current: document.createElement('input'),
  } as RefObject<HTMLInputElement>;
  const mockHandleClose = vi.fn();
  let deviceChangeListener: EventEmitter;
  const mockedHasMediaProcessorSupport = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    mockGetDevices.mockImplementation((cb) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      cb(null, [...audioInputDevices, ...videoInputDevices])
    );
    mockGetActiveAudioOutputDevice.mockResolvedValue(audioOutputDevices[0]);
    mockGetAudioOutputDevices.mockResolvedValue(audioOutputDevices);
    deviceChangeListener = new EventEmitter();

    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: mediaDevicesMock,
    });

    vi.spyOn(mediaDevicesMock, 'enumerateDevices').mockImplementation(() =>
      Promise.resolve(nativeDevices as MediaDeviceInfo[])
    );
    vi.spyOn(mediaDevicesMock, 'addEventListener').mockImplementation((event, listener) => {
      deviceChangeListener.on(event, listener as (...args: unknown[]) => void);
    });
    vi.spyOn(mediaDevicesMock, 'removeEventListener').mockImplementation((event, listener) => {
      deviceChangeListener.off(event, listener as (...args: unknown[]) => void);
    });

    (hasMediaProcessorSupport as Mock).mockImplementation(mockedHasMediaProcessorSupport);
    mockedHasMediaProcessorSupport.mockReturnValue(false);
  });

  describe('renders the audio settings menu', () => {
    const deviceType = 'audio';
    it('and renders the output devices if the browser supports setting audioOutput device', async () => {
      (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(true);

      render(
        <DeviceSettingsMenu
          deviceType={deviceType}
          handleToggle={mockHandleToggle}
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
          isOpen
          anchorRef={mockAnchorRef}
          handleClose={mockHandleClose}
          setIsOpen={mockSetIsOpen}
        />
      );

      const outputDevicesElement = screen.getByTestId('output-devices');
      await waitFor(() => expect(outputDevicesElement.children).to.have.length(3));
      expect(outputDevicesElement.firstChild).toHaveTextContent('System Default');
      expect(
        (outputDevicesElement.firstChild as HTMLOptionElement).classList.contains('Mui-selected')
      ).toBe(true);
      expect(
        (outputDevicesElement.children[1] as HTMLOptionElement).classList.contains('Mui-selected')
      ).toBe(false);
      expect(outputDevicesElement.children[1]).toHaveTextContent(
        'Soundcore Life A2 NC (Bluetooth)'
      );
      expect(outputDevicesElement.children[2]).toHaveTextContent('MacBook Pro Speakers (Built-in)');

      // test will fail without the await act
      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        fireEvent.click(outputDevicesElement.children[2]);
      });

      expect(mockSetAudioOutputDevice).toHaveBeenCalledWith(audioOutputDevices[2].deviceId);
      expect(
        (outputDevicesElement.children[2] as HTMLOptionElement).classList.contains('Mui-selected')
      ).toBe(true);
    });

    it('and renders the default output device if the browser does not support setting audioOutput device', async () => {
      (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(false);
      mockGetAudioOutputDevices.mockResolvedValue([vonageDefaultEmptyOutputDevice]);

      render(
        <DeviceSettingsMenu
          deviceType={deviceType}
          handleToggle={mockHandleToggle}
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
          isOpen
          anchorRef={mockAnchorRef}
          handleClose={mockHandleClose}
          setIsOpen={mockSetIsOpen}
        />
      );

      const outputDevicesElement = screen.getByTestId('output-devices');
      await waitFor(() => expect(outputDevicesElement.children).to.have.length(1));
      expect(outputDevicesElement.firstChild).toHaveTextContent('System Default');
      expect(
        (outputDevicesElement.firstChild as HTMLOptionElement).classList.contains('Mui-selected')
      ).toBe(true);

      act(() => {
        fireEvent.click(outputDevicesElement.firstChild as HTMLOptionElement);
      });

      expect(mockSetAudioOutputDevice).not.toHaveBeenCalled();
      expect(
        (outputDevicesElement.firstChild as HTMLOptionElement).classList.contains('Mui-selected')
      ).toBe(true);
    });

    it('and renders the speaker test if the browser supports audio output device selection', async () => {
      (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(true);

      await act(() =>
        render(
          <DeviceSettingsMenu
            deviceType={deviceType}
            handleToggle={mockHandleToggle}
            toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
            isOpen
            anchorRef={mockAnchorRef}
            handleClose={mockHandleClose}
            setIsOpen={mockSetIsOpen}
          />
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
          <DeviceSettingsMenu
            deviceType={deviceType}
            handleToggle={mockHandleToggle}
            toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
            isOpen
            anchorRef={mockAnchorRef}
            handleClose={mockHandleClose}
            setIsOpen={mockSetIsOpen}
          />
        )
      );

      const soundTest = screen.queryByTestId('soundTest');
      expect(soundTest).toBeInTheDocument();
    });

    it('and updates audio output device list if device is removed', async () => {
      (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(true);

      render(
        <DeviceSettingsMenu
          deviceType={deviceType}
          handleToggle={mockHandleToggle}
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
          isOpen
          anchorRef={mockAnchorRef}
          handleClose={mockHandleClose}
          setIsOpen={mockSetIsOpen}
        />
      );

      const outputDevicesElement = screen.getByTestId('output-devices');

      // Check initial list is correct
      await waitFor(() => expect(outputDevicesElement.children).to.have.length(3));
      expect(outputDevicesElement.firstChild).toHaveTextContent('System Default');
      expect(
        (outputDevicesElement.firstChild as HTMLOptionElement).classList.contains('Mui-selected')
      ).toBe(true);
      expect(
        (outputDevicesElement.children[1] as HTMLOptionElement).classList.contains('Mui-selected')
      ).toBe(false);
      expect(outputDevicesElement.children[1]).toHaveTextContent(
        'Soundcore Life A2 NC (Bluetooth)'
      );
      expect(outputDevicesElement.children[2]).toHaveTextContent('MacBook Pro Speakers (Built-in)');

      // select device 2
      // test will fail without the await act
      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        fireEvent.click(outputDevicesElement.children[1] as HTMLOptionElement);
      });

      expect(mockSetAudioOutputDevice).toHaveBeenCalledWith(audioOutputDevices[1].deviceId);
      expect(
        (outputDevicesElement.children[1] as HTMLOptionElement).classList.contains('Mui-selected')
      ).toBe(true);

      // Simulate device 2 removal
      mockGetActiveAudioOutputDevice.mockResolvedValue(audioOutputDevices[0]);
      mockGetAudioOutputDevices.mockResolvedValue([audioOutputDevices[0], audioOutputDevices[2]]);
      mockGetActiveAudioOutputDevice.mockResolvedValue(audioOutputDevices[0]);
      await act(() => deviceChangeListener.emit('devicechange'));
      await waitFor(() => expect(outputDevicesElement.children).to.have.length(2));
      expect(outputDevicesElement.firstChild).toHaveTextContent('System Default');
      expect((outputDevicesElement.firstChild as Element).classList.contains('Mui-selected')).toBe(
        true
      );
      expect(outputDevicesElement.children[1].classList.contains('Mui-selected')).toBe(false);
      expect(outputDevicesElement.children[1]).toHaveTextContent('MacBook Pro Speakers (Built-in)');
      const removedDevice = queryByText(outputDevicesElement, 'Soundcore Life A2 NC (Bluetooth)');
      expect(removedDevice).not.toBeInTheDocument();
    });
  });

  describe('renders the video effects menu', () => {
    const deviceType = 'video';
    it('if prompted', async () => {
      render(
        <DeviceSettingsMenu
          deviceType={deviceType}
          handleToggle={mockHandleToggle}
          handleClose={mockHandleClose}
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
          isOpen
          anchorRef={mockAnchorRef}
          setIsOpen={mockSetIsOpen}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('video-settings-devices-dropdown')).toBeInTheDocument();
      });
    });

    it('but does not render it if closed', async () => {
      render(
        <DeviceSettingsMenu
          deviceType={deviceType}
          handleToggle={mockHandleToggle}
          handleClose={mockHandleClose}
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
          isOpen={false}
          anchorRef={mockAnchorRef}
          setIsOpen={mockSetIsOpen}
        />
      );
      await waitFor(() => {
        expect(screen.queryByTestId('video-settings-devices-dropdown')).not.toBeInTheDocument();
      });
    });

    it('and renders the dropdown separator and background effects option when media processor is supported', async () => {
      mockedHasMediaProcessorSupport.mockReturnValue(true);
      render(
        <DeviceSettingsMenu
          deviceType={deviceType}
          handleToggle={mockHandleToggle}
          handleClose={mockHandleClose}
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
          isOpen
          anchorRef={mockAnchorRef}
          setIsOpen={mockSetIsOpen}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('dropdown-separator')).toBeVisible();
        expect(screen.queryByText('Video effects')).toBeVisible();
      });
    });

    it('and does not render the dropdown separator and video effects option when media processor is not supported', async () => {
      render(
        <DeviceSettingsMenu
          deviceType={deviceType}
          handleToggle={mockHandleToggle}
          handleClose={mockHandleClose}
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
          isOpen
          anchorRef={mockAnchorRef}
          setIsOpen={mockSetIsOpen}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('dropdown-separator')).not.toBeInTheDocument();
        expect(screen.queryByText('video effects')).not.toBeInTheDocument();
      });
    });

    it('and does not render the dropdown separator and video effects option when allowBackgroundEffects is false', async () => {
      render(
        <DeviceSettingsMenu
          deviceType={deviceType}
          handleToggle={mockHandleToggle}
          handleClose={mockHandleClose}
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
          isOpen
          anchorRef={mockAnchorRef}
          setIsOpen={mockSetIsOpen}
        />,
        {
          appConfigOptions: {
            value: {
              videoSettings: {
                allowBackgroundEffects: false,
              },
              meetingRoomSettings: {
                allowDeviceSelection: true,
              },
            },
          },
        }
      );

      await waitFor(() => {
        expect(screen.queryByTestId('dropdown-separator')).not.toBeInTheDocument();
        expect(screen.queryByText('video effects')).not.toBeInTheDocument();
      });
    });
  });
});

function render(
  ui: ReactElement,
  options?: {
    appConfigOptions?: AppConfigProviderWrapperOptions;
    audioOutputOptions?: AudioOutputProviderWrapperOptions['audioOutputOptions'];
  }
) {
  const { AppConfigWrapper } = makeAppConfigProviderWrapper(options?.appConfigOptions);
  const { AudioOutputProviderWrapper, audioOutputContext } = makeAudioOutputProviderWrapper({
    audioOutputOptions: options?.audioOutputOptions,
  });

  const ComposedWrapper = composeProviders(AudioOutputProviderWrapper, AppConfigWrapper);

  return { ...renderBase(ui, { wrapper: ComposedWrapper }), audioOutputContext };
}
