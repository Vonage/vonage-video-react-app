import { Menu, MenuItem } from '@mui/material';
import { Speaker } from '@mui/icons-material';
import { AudioOutputDevice, Device } from '@vonage/client-sdk-video';
import { ReactElement, useMemo } from 'react';
import { isGetActiveAudioOutputDeviceSupported } from '../../../utils/util';
import SoundTest from '../../SoundTest';
import cleanAndDedupeDeviceLabels from '../../../utils/cleanAndDedupeDeviceLabels/cleanAndDedupeDeviceLabels';

export type MenuDevicesWaitingRoomProps = {
  onClose: () => void;
  open: boolean;
  devices: (Device | AudioOutputDevice)[];
  anchorEl: HTMLElement | null;
  localSource: string | undefined | null;
  deviceChangeHandler: (deviceId: string) => void;
  deviceType: string;
};

/**
 * MenuDevices Component
 *
 * Displays a list of audio input, audio output, or video input devices to select which devices should be used.
 * For audio output devices, the list also displays an audio test button.
 * @param {MenuDevicesWaitingRoomProps} props - The props for the component.
 *  @property {Function} onClose - Menu close handler.
 *  @property {boolean} open - Whether the menu is open or not.
 *  @property {Device[] | AudioOutputDevice[]} devices - The list of devices for the menu.
 *  @property {HTMLElement | null} anchorEl - The anchor element.
 *  @property {string | undefined} localSource - The deviceId for the user's currently used device.
 *  @property {Function} deviceChangeHandler - Handles changing the device.
 *  @property {string} deviceType - The device type for the menu, either `audioInput`, `audioOutput`, or `videoInput`.
 * @returns {ReactElement} - The MenuDevices component
 */
const MenuDevices = ({
  devices,
  onClose,
  open,
  anchorEl,
  localSource,
  deviceChangeHandler,
  deviceType,
}: MenuDevicesWaitingRoomProps): ReactElement => {
  const handleClick = (deviceId: string) => {
    deviceChangeHandler(deviceId);
    onClose();
  };

  const processedDevices = useMemo(() => cleanAndDedupeDeviceLabels(devices), [devices]);

  return (
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      MenuListProps={{ 'aria-labelledby': 'basic-button' }}
      data-testid={`${deviceType}-menu`}
    >
      {(deviceType !== 'audioOutput' || isGetActiveAudioOutputDeviceSupported()) &&
        processedDevices.map((device) => (
          <MenuItem
            onClick={() => {
              if (!device.deviceId) {
                return;
              }
              handleClick(device.deviceId);
            }}
            key={device.deviceId}
            selected={device.deviceId === localSource}
            sx={{
              pl: 4,
              backgroundColor: device.deviceId === localSource ? 'rgba(26,115,232,.9)' : '',
            }}
          >
            {device.label}
          </MenuItem>
        ))}
      {deviceType === 'audioOutput' && (
        <SoundTest>
          <Speaker
            sx={{
              fontSize: 24,
              mr: 1,
              ml: 1.5,
              color: 'rgb(95, 99, 104)',
            }}
          />
        </SoundTest>
      )}
    </Menu>
  );
};

export default MenuDevices;
