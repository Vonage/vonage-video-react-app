import { ReactElement, RefObject, Dispatch, SetStateAction } from 'react';
import hasMediaProcessorSupport from '@utils/hasMediaProcessorSupport';
import InputDevices from '../InputAudioDevices';
import OutputDevices from '../OutputAudioDevices';
import ReduceNoiseTestSpeakers from '../ReduceNoiseTestSpeakers';
import useDropdownResizeObserver from '../../../hooks/useDropdownResizeObserver';
import VideoDevices from '../VideoDevices';
import DropdownSeparator from '../DropdownSeparator';
import VideoDevicesOptions from '../VideoDevicesOptions';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import { tv } from 'tailwind-variants';
import { env } from '../../../env';

export const testIds = {
  audioDropdown: 'audio-settings-devices-dropdown',
  videoDropdown: 'video-settings-devices-dropdown',
} as const;

export type DeviceSettingsMenuProps = {
  deviceType: 'audio' | 'video';
  handleToggle: () => void;
  toggleBackgroundEffects: () => void;
  isOpen: boolean;
  anchorRef: RefObject<HTMLInputElement | null>;
  handleClose: (event: MouseEvent | TouchEvent) => void;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

const settingsPaper = tv({
  base: 'relative z-1 w-[90vw] max-w-[400px] rounded-lg! bg-vera-surface! p-2 text-vera-on-surface min-[600px]:w-full min-[600px]:p-4',
  variants: {
    deviceType: {
      audio:
        '-translate-y-[2%] translate-x-[5%] max-[741px]:-translate-x-[10%] max-[450px]:-translate-x-[5%]',
      video:
        '-translate-y-[5%] -translate-x-[15%] max-[741px]:-translate-x-[40%] max-[450px]:-translate-x-[5%]',
    },
  },
});

/**
 * DeviceSettingsMenu Component
 *
 * This component renders a pop up that includes options to:
 * - select audio input and output devices
 * - select video input device
 * - on supported devices, an option to enable advanced noise suppression
 * - on supported devices, an option to blur the video background
 * @param {DeviceSettingsMenuProps} props - the props for this component.
 *  @property {boolean} deviceType - indicates the type of the device to control.
 *  @property {Function} handleToggle - the function that handles the toggle of video input device.
 *  @property {Function} toggleBackgroundEffects - the function that toggles background effects for video devices.
 *  @property {boolean} isOpen - the prop that shows whether the pop up needs to be opened.
 *  @property {RefObject<HTMLInputElement>} anchorRef - the anchor element to attach the pop up to.
 *  @property {Function} handleClose - the function that handles the closing of the pop up.
 *  @property {Function} setIsOpen - the function to set the open state of the pop up.
 * @returns {ReactElement} - the DeviceSettingsMenu component.
 */
const DeviceSettingsMenu = ({
  deviceType,
  handleToggle,
  toggleBackgroundEffects,
  isOpen,
  anchorRef,
  handleClose,
  setIsOpen,
}: DeviceSettingsMenuProps): ReactElement => {
  const isAudio = deviceType === 'audio';
  const shouldDisplayDeviceSelection = env.MEETING_ROOM_ALLOW_DEVICE_SELECTION;
  const shouldDisplayBackgroundEffects =
    hasMediaProcessorSupport('video') && env.ALLOW_BACKGROUND_EFFECTS;
  const shouldSeparateVideoSections =
    shouldDisplayDeviceSelection && shouldDisplayBackgroundEffects;

  const handleToggleBackgroundEffects = () => {
    toggleBackgroundEffects();
    handleToggle();
  };

  useDropdownResizeObserver({ setIsOpen, dropDownRefElement: anchorRef.current });

  const renderSettingsMenu = () => {
    if (isAudio) {
      return (
        <>
          {shouldDisplayDeviceSelection && (
            <>
              <div className="pt-2">
                <InputDevices handleToggle={handleToggle} />
              </div>
              <DropdownSeparator />
              <div className="pt-4">
                <OutputDevices handleToggle={handleToggle} />
              </div>
              <DropdownSeparator />
            </>
          )}
          <div className="pt-2">
            <ReduceNoiseTestSpeakers />
          </div>
        </>
      );
    }

    return (
      <>
        {shouldDisplayDeviceSelection && (
          <div className="pt-2">
            <VideoDevices handleToggle={handleToggle} />
          </div>
        )}
        {shouldSeparateVideoSections && <DropdownSeparator />}
        {shouldDisplayBackgroundEffects && (
          <div className="pt-2">
            <VideoDevicesOptions toggleBackgroundEffects={handleToggleBackgroundEffects} />
          </div>
        )}
      </>
    );
  };

  return (
    <Popper
      data-testid={isAudio ? testIds.audioDropdown : testIds.videoDropdown}
      open={isOpen}
      anchorEl={anchorRef.current}
      transition
      disablePortal
      placement="bottom-start"
    >
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
        >
          <Box className="text-left font-normal">
            <ClickAwayListener onClickAway={handleClose}>
              <Paper className={settingsPaper({ deviceType })}>{renderSettingsMenu()}</Paper>
            </ClickAwayListener>
          </Box>
        </Grow>
      )}
    </Popper>
  );
};

export default DeviceSettingsMenu;
