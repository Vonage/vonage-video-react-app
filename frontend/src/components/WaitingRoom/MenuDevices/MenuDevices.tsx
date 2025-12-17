import { AudioOutputDevice, Device } from '@vonage/client-sdk-video';
import { ReactElement, useMemo } from 'react';
import MenuItem from '@ui/MenuItem';
import Menu from '@ui/Menu';
import VividIcon from '@components/VividIcon';
import Box from '@ui/Box';
import cleanAndDedupeDeviceLabels from '@utils/cleanAndDedupeDeviceLabels/cleanAndDedupeDeviceLabels';
import SoundTest from '../../SoundTest';
import { isGetActiveAudioOutputDeviceSupported } from '@utils/util';

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
          >
            {device.label}
          </MenuItem>
        ))}
      {deviceType === 'audioOutput' && (
        <SoundTest>
          <Box sx={{ mr: 1 }}>
            <VividIcon name="hearing-line" customSize={-5} />
          </Box>
        </SoundTest>
      )}
    </Menu>
  );
};

export default MenuDevices;
