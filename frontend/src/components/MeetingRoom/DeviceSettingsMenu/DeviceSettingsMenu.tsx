import { ClickAwayListener } from '@mui/material';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { ReactElement, RefObject, Dispatch, SetStateAction } from 'react';
import { PopperChildrenProps } from '@mui/base';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import useAppConfig from '@Context/AppConfig/hooks/useAppConfig';
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
  const allowBackgroundEffects = useAppConfig(
    ({ videoSettings }) => videoSettings.allowBackgroundEffects
  );

  const isAudio = deviceType === 'audio';
  const shouldDisplayBackgroundEffects = hasMediaProcessorSupport() && allowBackgroundEffects;

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
                sx={(theme) => ({
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.primary.contrastText,
                  padding: { xs: 1, sm: 2 },
                  borderRadius: 2,
                  zIndex: 1,
                  transform: isAudio
                    ? 'translateY(-2%) translateX(5%)'
                    : 'translateY(-5%) translateX(-15%)',
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
                  width: { xs: '90vw', sm: '100%' },
                  maxWidth: 400,
                  position: 'relative',
                })}
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
