import { ClickAwayListener } from '@mui/material';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { useTheme } from '@mui/material/styles';
import { ReactElement, RefObject, Dispatch, SetStateAction } from 'react';
import { PopperChildrenProps } from '@mui/base';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import InputDevices from '../InputDevices';
import OutputDevices from '../OutputDevices';
import ReduceNoiseTestSpeakers from '../ReduceNoiseTestSpeakers';
import useDropdownResizeObserver from '../../../hooks/useDropdownResizeObserver';
import VideoDevices from '../VideoDevices';
import DropdownSeparator from '../DropdownSeparator';
import VideoDevicesOptions from '../VideoDevicesOptions';

export type DeviceSettingsMenuProps = {
  deviceType: 'audio' | 'video';
  handleToggle: () => void;
  isOpen: boolean;
  anchorRef: RefObject<HTMLInputElement>;
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
 *  @property {() => void} handleToggle - the function that handles the toggle of video input device.
 *  @property {boolean} isOpen - the prop that shows whether the pop up needs to be opened.
 *  @property {RefObject<HTMLInputElement>} anchorRef - the anchor element to attach the pop up to.
 *  @property {Function} handleClose - the function that handles the closing of the pop up.
 * @returns {ReactElement} - the DeviceSettingsMenu component.
 */
const DeviceSettingsMenu = ({
  deviceType,
  handleToggle,
  isOpen,
  anchorRef,
  handleClose,
  setIsOpen,
}: DeviceSettingsMenuProps): ReactElement | false => {
  const isAudio = deviceType === 'audio';
  const theme = useTheme();
  const customLightBlueColor = 'rgb(138, 180, 248)';

  useDropdownResizeObserver({ setIsOpen, dropDownRefElement: anchorRef.current });

  const renderSettingsMenu = () => {
    if (isAudio) {
      return (
        <>
          <InputDevices handleToggle={handleToggle} customLightBlueColor={customLightBlueColor} />
          <OutputDevices handleToggle={handleToggle} customLightBlueColor={customLightBlueColor} />
          <ReduceNoiseTestSpeakers customLightBlueColor={customLightBlueColor} />
        </>
      );
    }

    return (
      <>
        <VideoDevices handleToggle={handleToggle} customLightBlueColor={customLightBlueColor} />
        {hasMediaProcessorSupport() && (
          <>
            <DropdownSeparator />
            <VideoDevicesOptions customLightBlueColor={customLightBlueColor} />
          </>
        )}
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
      {({ TransitionProps, placement }: PopperChildrenProps) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
          }}
        >
          <div className="text-left font-normal">
            <ClickAwayListener onClickAway={handleClose}>
              <Paper
                sx={{
                  backgroundColor: 'rgb(32, 33, 36)',
                  color: '#fff',
                  padding: { xs: 1, sm: 2 }, // responsive padding
                  borderRadius: 2,
                  zIndex: 1,
                  transform: isAudio
                    ? 'translateY(-2%) translateX(5%)'
                    : 'translateY(-5%) translateX(-15%)', // default transform
                  [theme.breakpoints.down(741)]: {
                    transform: isAudio
                      ? 'translateY(-2%) translateX(-10%)'
                      : 'translateY(-5%) translateX(-40%)',
                  },
                  [theme.breakpoints.down(450)]: {
                    transform: isAudio
                      ? 'translateY(-2%) translateX(-5%)'
                      : 'translateY(-5%) translateX(-5%)',
                  },
                  width: { xs: '90vw', sm: '100%' }, // responsive width
                  maxWidth: 400, // max width for larger screens
                  position: 'relative', // ensures the transform is applied correctly
                }}
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
