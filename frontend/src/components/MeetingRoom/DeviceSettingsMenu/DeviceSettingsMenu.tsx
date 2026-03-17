import { ReactElement, RefObject, Dispatch, SetStateAction } from 'react';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import classNames from 'classnames';
import InputDevices from '../InputAudioDevices';
import OutputDevices from '../OutputAudioDevices';
import ReduceNoiseTestSpeakers from '../ReduceNoiseTestSpeakers';
import useDropdownResizeObserver from '../../../hooks/useDropdownResizeObserver';
import VideoDevices from '../VideoDevices';
import DropdownSeparator from '../DropdownSeparator';
import VideoDevicesOptions from '../VideoDevicesOptions';
import MirrorSelfViewToggle from '../MirrorSelfViewToggle/MirrorSelfViewToggle';
import MenuList from '@mui/material/MenuList';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import { env } from '../../../env';

export type DeviceSettingsMenuProps = {
  deviceType: 'audio' | 'video';
  handleToggle: () => void;
  toggleBackgroundEffects: () => void;
  isOpen: boolean;
  anchorRef: RefObject<HTMLInputElement | null>;
  handleClose: (event: MouseEvent | TouchEvent) => void;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

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
}: DeviceSettingsMenuProps): ReactElement | false => {
  const isAudio = deviceType === 'audio';
  const shouldDisplayBackgroundEffects = hasMediaProcessorSupport() && env.ALLOW_BACKGROUND_EFFECTS;
  const popperTransformClasses = isAudio
    ? [
        'translate-y-[-2%]',
        'translate-x-[5%]',
        'max-[740px]:translate-x-[-10%]',
        'max-[450px]:translate-x-[-5%]',
      ]
    : [
        'translate-y-[-5%]',
        'translate-x-[-15%]',
        'max-[740px]:translate-x-[-40%]',
        'max-[450px]:translate-x-[-5%]',
      ];

  const handleToggleBackgroundEffects = () => {
    toggleBackgroundEffects();
    handleToggle();
  };

  useDropdownResizeObserver({ setIsOpen, dropDownRefElement: anchorRef.current });

  const renderSettingsMenu = () => {
    if (isAudio) {
      return (
        <>
          <InputDevices handleToggle={handleToggle} />
          <OutputDevices handleToggle={handleToggle} />
          <ReduceNoiseTestSpeakers />
        </>
      );
    }

    return (
      <>
        <VideoDevices handleToggle={handleToggle} />
        {shouldDisplayBackgroundEffects && (
          <>
            <DropdownSeparator />
            <VideoDevicesOptions toggleBackgroundEffects={handleToggleBackgroundEffects} />
          </>
        )}
        <DropdownSeparator />
        <MenuList className="mt-1 flex flex-col">
          <MirrorSelfViewToggle />
        </MenuList>
      </>
    );
  };

  return (
    <Popper
      data-testid={isAudio ? 'audio-settings-devices-dropdown' : 'video-settings-devices-dropdown'}
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
          <div className="text-left font-normal">
            <ClickAwayListener onClickAway={handleClose}>
              <Paper
                className={classNames(
                  'relative z-10',
                  'bg-vera-surface text-vera-on-surface',
                  'p-1 sm:p-2',
                  'rounded-vera-large',
                  'w-[90vw] sm:w-full max-w-[400px]',
                  popperTransformClasses
                )}
              >
                {renderSettingsMenu()}
              </Paper>
            </ClickAwayListener>
          </div>
        </Grow>
      )}
    </Popper>
  );
};

export default DeviceSettingsMenu;
