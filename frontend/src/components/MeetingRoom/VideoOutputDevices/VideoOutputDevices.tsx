import { ReactElement, RefObject } from 'react';
import { ClickAwayListener } from '@mui/material';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import Grow from '@mui/material/Grow';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { PopperChildrenProps } from '@mui/base';
import VideoDevices from './VideoDevices';
import VideoDevicesOptions from './VideoDevicesOptions';
import displayOnDesktop from '../../../utils/displayOnDesktop';
import DropdownSeparator from '../DropdownSeparator';

export type VideoOutputDevicesProps = {
  handleToggle: () => void;
  isOpen: boolean;
  anchorRef: RefObject<HTMLInputElement>;
  handleClose: (event: MouseEvent | TouchEvent) => void;
};

/**
 * VideoOutputDevices Component
 *
 * This component renders a pop up that includes options to:
 * - select video output device
 * - on supported devices, an option to blur the video background
 * @param {VideoOutputDevicesProps} props - the props for this component.
 *  @property {() => void} handleToggle - the function that handles the toggle of video output device.
 *  @property {boolean} isOpen - the prop that shows whether the pop up needs to be opened.
 *  @property {RefObject<HTMLInputElement>} anchorRef - the anchor element to attach the pop up to.
 *  @property {Function} handleClose - the function that handles the closing of the pop up.
 * @returns {ReactElement} - the video output devices pop up component.
 */
const VideoOutputDevices = ({
  handleToggle,
  isOpen,
  anchorRef,
  handleClose,
}: VideoOutputDevicesProps): ReactElement => {
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
          <div className="text-left font-normal">
            <ClickAwayListener onClickAway={handleClose}>
              <Paper
                sx={{
                  backgroundColor: 'rgb(32, 33, 36)',
                  color: '#fff',
                  padding: { xs: 1, sm: 2 }, // responsive padding
                  borderRadius: 2,
                  zIndex: 1,
                  transform: 'translateY(-5%) translateX(-15%)', // default transform
                  [theme.breakpoints.down(741)]: {
                    transform: 'translateY(-5%) translateX(-40%)',
                  },
                  [theme.breakpoints.down(450)]: {
                    transform: 'translateY(-5%) translateX(-5%)',
                  },
                  width: { xs: '90vw', sm: '100%' }, // responsive width
                  maxWidth: 400, // max width for larger screens
                  position: 'relative', // ensures the transform is applied correctly
                }}
              >
                <VideoDevices
                  handleToggle={handleToggle}
                  customLightBlueColor={customLightBlueColor}
                />

                {hasMediaProcessorSupport() && displayOnDesktop() && (
                  <>
                    <DropdownSeparator />
                    <VideoDevicesOptions customLightBlueColor={customLightBlueColor} />
                  </>
                )}
              </Paper>
            </ClickAwayListener>
          </div>
        </Grow>
      )}
    </Popper>
  );
};

export default VideoOutputDevices;
