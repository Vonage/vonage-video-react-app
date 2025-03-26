import { ReactElement, RefObject, Dispatch, SetStateAction } from 'react';
import { ClickAwayListener } from '@mui/material';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import Grow from '@mui/material/Grow';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import { PopperChildrenProps } from '@mui/base';
import VideoDevices from './VideoDevices';
import VideoDevicesOptions from './VideoDevicesOptions';
import DropdownSeparator from '../DropdownSeparator';
import useDropdownResizeObserver from '../../../hooks/useDropdownResizeObserver';

export type VideoSettingsMenuProps = {
  handleToggle: () => void;
  isOpen: boolean;
  anchorRef: RefObject<HTMLInputElement>;
  handleClose: (event: MouseEvent | TouchEvent) => void;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

/**
 * VideoSettingsMenu Component
 *
 * This component renders a pop up that includes options to:
 * - select video output device
 * - on supported devices, an option to blur the video background
 * @param {VideoSettingsMenuProps} props - the props for this component.
 *  @property {() => void} handleToggle - the function that handles the toggle of video input device.
 *  @property {boolean} isOpen - the prop that shows whether the pop up needs to be opened.
 *  @property {RefObject<HTMLInputElement>} anchorRef - the anchor element to attach the pop up to.
 *  @property {Function} handleClose - the function that handles the closing of the pop up.
 * @returns {ReactElement} - the video input devices pop up component.
 */
const VideoSettingsMenu = ({
  handleToggle,
  isOpen,
  anchorRef,
  handleClose,
  setIsOpen,
}: VideoSettingsMenuProps): ReactElement => {
  const theme = useTheme();
  const customLightBlueColor = 'rgb(138, 180, 248)';

  useDropdownResizeObserver({ setIsOpen, dropDownRefElement: anchorRef.current });

  return (
    <Popper
      data-testid="video-settings-devices-dropdown"
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
                {hasMediaProcessorSupport() && (
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

export default VideoSettingsMenu;
