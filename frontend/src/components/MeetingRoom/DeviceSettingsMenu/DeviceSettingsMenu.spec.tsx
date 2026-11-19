import {
  act,
  fireEvent,
  queryByText,
  screen,
  waitFor,
  within,
  render as renderBase,
} from '@testing-library/react';
import { describe, beforeEach, it, vi, expect } from 'vitest';
import { ReactElement, RefObject } from 'react';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import type { MediaDeviceInfoJSON } from '@web/types';
import { makeTestProvider } from '@test/providers';
import { isSinkIdSupported } from '@web/platform';
import { env } from '../../../env';
import {
  makeMediaDeviceInfos,
  makeMediaStreamMock,
  setupWindowNavigatorMock,
} from '@web-test/fixtures';
import { mediaDevices$ } from '@core/stores';
import DeviceSettingsMenuComponent, {
  testIds as deviceSettingsMenuTestIds,
} from './DeviceSettingsMenu';
import { testIds as dropdownSeparatorTestIds } from '../DropdownSeparator/DropdownSeparator';
import { testIds as outputAudioDevicesTestIds } from '../OutputAudioDevices/OutputAudioDevices';
import { testIds as soundTestTestIds } from '../../SoundTest/SoundTest';
import { testIds as inputAudioDevicesTestIds } from '../InputAudioDevices/InputAudioDevices';
import { testIds as videoDevicesTestIds } from '../VideoDevices/VideoDevices';
import { testIds as videoDevicesOptionsTestIds } from '../VideoDevicesOptions/VideoDevicesOptions';
import userEvent from '@testing-library/user-event';

const { mockHasMediaProcessorSupport, mockGetActiveAudioOutputDevice, mockSetAudioOutputDevice } =
  vi.hoisted(() => {
    return {
      mockHasMediaProcessorSupport: vi.fn().mockReturnValue(true),
      mockGetActiveAudioOutputDevice: vi.fn(),
      mockSetAudioOutputDevice: vi.fn(),
    };
  });

vi.mock('@vonage/client-sdk-video', () => ({
  hasMediaProcessorSupport: mockHasMediaProcessorSupport,
  getActiveAudioOutputDevice: mockGetActiveAudioOutputDevice,
  setAudioOutputDevice: mockSetAudioOutputDevice,
}));

vi.mock('@web/platform');

const someDevices = makeMediaDeviceInfos();

describe('DeviceSettingsMenu Component', () => {
  const mockHandleToggle = vi.fn();
  const mockHandleToggleBackgroundEffects = vi.fn();
  const mockSetIsOpen = vi.fn();
  const mockAnchorRef = {
    current: document.createElement('input'),
  } as RefObject<HTMLInputElement>;
  const mockHandleClose = vi.fn();

  let defaultSpeakers: MediaDeviceInfoJSON;
  let usbHeadsetSpeakers: MediaDeviceInfoJSON;
  let bluetoothSpeakers: MediaDeviceInfoJSON;

  beforeEach(() => {
    vi.mocked(isSinkIdSupported).mockReturnValue(true);

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

    // Mock HTMLAudioElement methods for SoundTest
    vi.spyOn(HTMLAudioElement.prototype, 'pause').mockImplementation(vi.fn());
    vi.spyOn(HTMLAudioElement.prototype, 'play').mockResolvedValue(undefined);

    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: someDevices,
    }));

    const audioOutputDevices = Object.values(mediaDevices$.mediaDevicesMap$.getState().audiooutput);
    [defaultSpeakers, usbHeadsetSpeakers, bluetoothSpeakers] = audioOutputDevices;

    // Mock Vonage SDK audio output functions
    mockGetActiveAudioOutputDevice.mockResolvedValue(defaultSpeakers);
    mockSetAudioOutputDevice.mockImplementation(() => Promise.resolve());

    vi.mocked(hasMediaProcessorSupport).mockReturnValue(false);
  });

  describe('renders the audio settings menu', () => {
    const deviceType = 'audio';

    it('and renders the output devices if the browser supports setting audioOutput device', async () => {
      vi.mocked(isSinkIdSupported).mockReturnValue(true);

      const selectDeviceSpy = vi.spyOn(mediaDevices$.actions, 'selectDevice');

      render(
        <DeviceSettingsMenuComponent
          deviceType={deviceType}
          handleToggle={mockHandleToggle}
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
          isOpen
          anchorRef={mockAnchorRef}
          handleClose={mockHandleClose}
          setIsOpen={mockSetIsOpen}
        />
      );

      const outputDevicesElement = screen.getByTestId(outputAudioDevicesTestIds.list);
      await waitFor(() => expect(outputDevicesElement.children).to.have.length(3));
      expect(outputDevicesElement.firstChild).toHaveTextContent(defaultSpeakers.label);

      expect(
        (outputDevicesElement.children[1] as HTMLOptionElement).classList.contains('Mui-selected')
      ).toBe(false);

      expect(outputDevicesElement.children[1]).toHaveTextContent(usbHeadsetSpeakers.label);
      expect(outputDevicesElement.children[2]).toHaveTextContent(bluetoothSpeakers.label);

      // test will fail without the await act
      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        fireEvent.click(outputDevicesElement.children[2]);
      });

      // Verify the store action was called
      expect(selectDeviceSpy).toHaveBeenCalledWith('audiooutput', bluetoothSpeakers.deviceId);
    });

    it('and renders the default output device if the browser does not support setting audioOutput device', async () => {
      vi.mocked(isSinkIdSupported).mockReturnValue(false);

      render(
        <DeviceSettingsMenuComponent
          deviceType={deviceType}
          handleToggle={mockHandleToggle}
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
          isOpen
          anchorRef={mockAnchorRef}
          handleClose={mockHandleClose}
          setIsOpen={mockSetIsOpen}
        />
      );

      const outputDevicesElement = screen.getByTestId(outputAudioDevicesTestIds.list);
      await waitFor(() => expect(outputDevicesElement.children).to.have.length(1));
      expect(outputDevicesElement.firstChild).toHaveTextContent('System Default');
      expect(
        (outputDevicesElement.firstChild as HTMLOptionElement).classList.contains('Mui-selected')
      ).toBe(true);

      act(() => {
        fireEvent.click(outputDevicesElement.firstChild as HTMLOptionElement);
      });

      // Verify the Vonage SDK function was not called
      expect(mockSetAudioOutputDevice).not.toHaveBeenCalled();
      expect(
        (outputDevicesElement.firstChild as HTMLOptionElement).classList.contains('Mui-selected')
      ).toBe(true);
    });

    it('and renders the speaker test if the browser supports audio output device selection', async () => {
      vi.mocked(isSinkIdSupported).mockReturnValue(true);

      await act(() =>
        render(
          <DeviceSettingsMenuComponent
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

      const outputDevicesElement = screen.getByTestId(outputAudioDevicesTestIds.list);
      expect(outputDevicesElement).toBeInTheDocument();
    });

    it('and renders the speaker test devices if the browser does not support audio output device selection', async () => {
      vi.mocked(isSinkIdSupported).mockReturnValue(false);
      vi.mocked(isSinkIdSupported).mockReturnValue(false);

      await act(() =>
        render(
          <DeviceSettingsMenuComponent
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

      const soundTest = screen.queryByTestId(soundTestTestIds.button);
      expect(soundTest).toBeInTheDocument();
    });

    it('and updates audio output device list if device is removed', async () => {
      vi.mocked(isSinkIdSupported).mockReturnValue(true);

      const selectDeviceSpy = vi.spyOn(mediaDevices$.actions, 'selectDevice');

      render(
        <DeviceSettingsMenuComponent
          deviceType={deviceType}
          handleToggle={mockHandleToggle}
          toggleBackgroundEffects={mockHandleToggleBackgroundEffects}
          isOpen
          anchorRef={mockAnchorRef}
          handleClose={mockHandleClose}
          setIsOpen={mockSetIsOpen}
        />
      );

      const outputDevicesElement = screen.getByTestId(outputAudioDevicesTestIds.list);

      // Check initial list is correct
      await waitFor(() => expect(outputDevicesElement.children).to.have.length(3));
      expect(outputDevicesElement.firstChild).toHaveTextContent(defaultSpeakers.label);
      expect(outputDevicesElement.children[1]).toHaveTextContent(usbHeadsetSpeakers.label);
      expect(outputDevicesElement.children[2]).toHaveTextContent(bluetoothSpeakers.label);

      // select device 2
      // eslint-disable-next-line @typescript-eslint/require-await
      await act(async () => {
        fireEvent.click(outputDevicesElement.children[1] as HTMLOptionElement);
      });

      // Verify the store action was called
      expect(selectDeviceSpy).toHaveBeenCalledWith('audiooutput', usbHeadsetSpeakers.deviceId);

      // Simulate device 2 removal - remove USB headset
      const devicesWithoutUSB = someDevices.filter(
        (d) => d.deviceId !== usbHeadsetSpeakers.deviceId
      );

      act(() => {
        mediaDevices$.setState((state) => ({
          ...state,
          mediaDeviceInfo: devicesWithoutUSB,
        }));
      });

      await waitFor(() => expect(outputDevicesElement.children).to.have.length(2));
      expect(outputDevicesElement.firstChild).toHaveTextContent(defaultSpeakers.label);
      // Note: After device removal, the first device (default) should be selected
      // but the component doesn't automatically update currentAudioOutputDevice context
      // It only updates when user explicitly selects a device or when reconciliation happens
      expect(outputDevicesElement.children[1]).toHaveTextContent(bluetoothSpeakers.label);
      const removedDevice = queryByText(outputDevicesElement, usbHeadsetSpeakers.label);
      expect(removedDevice).not.toBeInTheDocument();
    });
  });

  describe('renders the video effects menu', () => {
    const deviceType = 'video';
    it('if prompted', async () => {
      render(
        <DeviceSettingsMenuComponent
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
        expect(screen.queryByTestId(deviceSettingsMenuTestIds.videoDropdown)).toBeInTheDocument();
      });
    });

    it('but does not render it if closed', async () => {
      render(
        <DeviceSettingsMenuComponent
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
        expect(
          screen.queryByTestId(deviceSettingsMenuTestIds.videoDropdown)
        ).not.toBeInTheDocument();
      });
    });

    it('and renders the dropdown separator and background effects option when media processor is supported', async () => {
      vi.mocked(hasMediaProcessorSupport).mockReturnValue(true);

      render(
        <DeviceSettingsMenuComponent
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
        expect(screen.queryByTestId(dropdownSeparatorTestIds.separator)).toBeVisible();
        expect(screen.queryByText('Video effects')).toBeVisible();
      });
    });

    it('and does not render the dropdown separator and video effects option when media processor is not supported', async () => {
      render(
        <DeviceSettingsMenuComponent
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
        expect(screen.queryByTestId(dropdownSeparatorTestIds.separator)).not.toBeInTheDocument();
        expect(screen.queryByText('video effects')).not.toBeInTheDocument();
      });
    });

    it('and does not render the dropdown separator and video effects option when allowBackgroundEffects is false', async () => {
      env.partialUpdate({
        ALLOW_BACKGROUND_EFFECTS: false,
        MEETING_ROOM_ALLOW_DEVICE_SELECTION: true,
      });

      render(
        <DeviceSettingsMenuComponent
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
        expect(screen.queryByTestId(dropdownSeparatorTestIds.separator)).not.toBeInTheDocument();
        expect(screen.queryByText('video effects')).not.toBeInTheDocument();
      });
    });
  });

  describe('device selection', () => {
    it('lets the user switch microphones when device selection is allowed', async () => {
      const handleToggle = vi.fn();
      const selectDeviceSpy = vi.spyOn(mediaDevices$.actions, 'selectDevice');
      const user = userEvent.setup();
      renderMenu({ deviceType: 'audio', handleToggle });

      const microphones = screen.getByTestId(inputAudioDevicesTestIds.list);
      await user.click(within(microphones).getByText('USB Headset Microphone'));

      expect(handleToggle).toHaveBeenCalledTimes(1);
      expect(selectDeviceSpy).toHaveBeenCalledWith('audioinput', 'audio-input-2');
    });

    it('still lets the user test the speakers when device selection is not allowed', async () => {
      env.partialUpdate({ MEETING_ROOM_ALLOW_DEVICE_SELECTION: false });
      const user = userEvent.setup();
      renderMenu({ deviceType: 'audio' });

      await user.click(screen.getByTestId(soundTestTestIds.button));

      expect(HTMLAudioElement.prototype.play).toHaveBeenCalled();
      expect(screen.queryByTestId(inputAudioDevicesTestIds.list)).not.toBeInTheDocument();
    });

    it('still lets the user open the video effects when device selection is not allowed', async () => {
      env.partialUpdate({
        MEETING_ROOM_ALLOW_DEVICE_SELECTION: false,
        ALLOW_BACKGROUND_EFFECTS: true,
      });
      vi.mocked(hasMediaProcessorSupport).mockReturnValue(true);
      const toggleBackgroundEffects = vi.fn();
      const user = userEvent.setup();
      renderMenu({ deviceType: 'video', toggleBackgroundEffects });

      await user.click(screen.getByTestId(videoDevicesOptionsTestIds.backgroundEffectsText));

      expect(toggleBackgroundEffects).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId(videoDevicesTestIds.list)).not.toBeInTheDocument();
    });
  });

  it.each([
    {
      deviceType: 'audio',
      allowDeviceSelection: true,
      allowBackgroundEffects: false,
      separators: 2,
    },
    {
      deviceType: 'audio',
      allowDeviceSelection: false,
      allowBackgroundEffects: false,
      separators: 0,
    },
    {
      deviceType: 'video',
      allowDeviceSelection: true,
      allowBackgroundEffects: true,
      separators: 1,
    },
    {
      deviceType: 'video',
      allowDeviceSelection: false,
      allowBackgroundEffects: true,
      separators: 0,
    },
    {
      deviceType: 'video',
      allowDeviceSelection: true,
      allowBackgroundEffects: false,
      separators: 0,
    },
  ] as const)(
    'only separates rendered sections in the $deviceType menu (device selection: $allowDeviceSelection, background effects: $allowBackgroundEffects)',
    ({ deviceType, allowDeviceSelection, allowBackgroundEffects, separators }) => {
      env.partialUpdate({
        MEETING_ROOM_ALLOW_DEVICE_SELECTION: allowDeviceSelection,
        ALLOW_BACKGROUND_EFFECTS: allowBackgroundEffects,
      });
      vi.mocked(hasMediaProcessorSupport).mockReturnValue(true);
      renderMenu({ deviceType });

      const renderedSeparators = screen.queryAllByTestId(dropdownSeparatorTestIds.separator);

      expect(renderedSeparators).toHaveLength(separators);
      renderedSeparators.forEach((separator) => {
        expect(isSection(separator.previousElementSibling)).toBe(true);
        expect(isSection(separator.nextElementSibling)).toBe(true);
      });
    }
  );

  function renderMenu({
    deviceType,
    handleToggle = mockHandleToggle,
    toggleBackgroundEffects = mockHandleToggleBackgroundEffects,
  }: {
    deviceType: 'audio' | 'video';
    handleToggle?: () => void;
    toggleBackgroundEffects?: () => void;
  }) {
    return render(
      <DeviceSettingsMenuComponent
        deviceType={deviceType}
        handleToggle={handleToggle}
        handleClose={mockHandleClose}
        toggleBackgroundEffects={toggleBackgroundEffects}
        isOpen
        anchorRef={mockAnchorRef}
        setIsOpen={mockSetIsOpen}
      />
    );
  }
});

function isSection(element: Element | null): boolean {
  return !!element && element.getAttribute('data-testid') !== dropdownSeparatorTestIds.separator;
}

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([]);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
