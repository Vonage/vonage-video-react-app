import { ClickAwayListener } from '@mui/material';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { useTheme } from '@mui/material/styles';
import { ReactElement, RefObject } from 'react';
import { PopperChildrenProps } from '@mui/base';
import InputDevices from './InputDevices';
import OutputDevices from './OutputDevices';
import ReduceNoiseTestSpeakers from './ReduceNoiseTestSpeakers';

export type AudioInputOutputDevicesProps = {
  handleToggle: () => void;
  isOpen: boolean;
  anchorRef: RefObject<HTMLInputElement>;
  handleClose: (event: MouseEvent | TouchEvent) => void;
};

/**
 * AudioInputOutputDevices Component
 *
 * Displays the audio input and audio output devices (for non-WebKit browsers) in a selectable menu for the user to switch devices.
 * For supported browsers, displays the toggle for the Vonage Video API advanced noise suppression filter.
 * @param {AudioInputOutputDevicesProps} props - The props for the component.
 *  @property {() => void} handleToggle - Function to show or hide the menu.
 *  @property {boolean} isOpen - Whether the menu is open or closed.
 *  @property {RefObject<HTMLInputElement>} anchorRef - The reference element for the AudioInputOutputDevices component
 *  @property {Function} handleClose - Function to close the menu.
 * @returns {ReactElement} - The AudioInputOutputDevices component.
 */
const AudioInputOutputDevices = ({
  handleToggle,
  isOpen,
  anchorRef,
  handleClose,
}: AudioInputOutputDevicesProps): ReactElement => {
  const theme = useTheme();
  const customLightBlueColor = 'rgb(138, 180, 248)';

  return (
    <Popper
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
          <div className="font-normal text-left">
            <ClickAwayListener onClickAway={handleClose}>
              <Paper
                sx={{
                  backgroundColor: 'rgb(32, 33, 36)',
                  color: '#fff',
                  padding: { xs: 1, sm: 2 }, // responsive padding
                  borderRadius: 2,
                  zIndex: 1,
                  transform: 'translateY(-2%) translateX(5%)', // default transform
                  [theme.breakpoints.down(741)]: {
                    transform: 'translateY(-2%) translateX(-10%)',
                  },
                  [theme.breakpoints.down(450)]: {
                    transform: 'translateY(-2%) translateX(-5%)',
                  },
                  width: { xs: '90vw', sm: '100%' }, // responsive width
                  maxWidth: 400, // max width for larger screens
                  position: 'relative', // ensures the transform is applied correctly
                }}
              >
                <InputDevices
                  handleToggle={handleToggle}
                  customLightBlueColor={customLightBlueColor}
                />
                <OutputDevices
                  handleToggle={handleToggle}
                  customLightBlueColor={customLightBlueColor}
                />
                <ReduceNoiseTestSpeakers customLightBlueColor={customLightBlueColor} />
              </Paper>
            </ClickAwayListener>
          </div>
        </Grow>
      )}
    </Popper>
  );
};

export default AudioInputOutputDevices;
