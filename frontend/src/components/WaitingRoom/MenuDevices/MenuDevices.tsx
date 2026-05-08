import { ReactElement, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import VividIcon from '@components/VividIcon';
import Box from '@mui/material/Box';
import cleanAndDedupeDeviceLabels from '@utils/cleanAndDedupeDeviceLabels/cleanAndDedupeDeviceLabels';
import SoundTest from '../../SoundTest';
import { isGetActiveAudioOutputDeviceSupported, isAndroid } from '@utils/util';
import mediaDevices$ from '@core/stores/devices';

const isVideoDeviceAvailable = async (deviceId: string): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
      audio: false,
    });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch {
    return false;
  }
};

export type MenuDevicesWaitingRoomProps = {
  onClose: () => void;
  open: boolean;
  mediaDeviceKind: MediaDeviceKind;
  anchorEl: HTMLElement | null;
  deviceChangeHandler: (deviceId: string) => void;
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
 * @returns {ReactElement} - The MenuDevices component
 */
const MenuDevices = ({
  mediaDeviceKind,
  onClose,
  open,
  anchorEl,
  deviceChangeHandler,
}: MenuDevicesWaitingRoomProps): ReactElement => {
  const { t } = useTranslation();
  const devices = mediaDevices$.useMediaDevices(mediaDeviceKind, Object.values<MediaDeviceInfo>);

  const localSource = mediaDevices$.useDeviceId(mediaDeviceKind);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleClick = async (deviceId: string) => {
    if (mediaDeviceKind === 'videoinput' && isAndroid()) {
      const audioDeviceMap = mediaDevices$.mediaDevicesMap$.getState().audioinput;
      const alsoAppearsAsAudio = deviceId in audioDeviceMap;

      if (alsoAppearsAsAudio) {
        const available = await isVideoDeviceAvailable(deviceId);
        if (!available) {
          setCameraError(t('devices.video.camera.unavailable'));
          return;
        }
      }
    }

    deviceChangeHandler(deviceId);

    onClose();
  };

  const processedDevices = useMemo(() => cleanAndDedupeDeviceLabels(devices), [devices]);
  const shouldDisplayDevices =
    mediaDeviceKind !== 'audiooutput' || isGetActiveAudioOutputDeviceSupported();
  const shouldDisplayEmptyState = shouldDisplayDevices && processedDevices.length === 0;

  return (
    <>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
        data-testid={`${mediaDeviceKind}-menu`}
      >
        {shouldDisplayDevices &&
          processedDevices.map((device) => (
            <MenuItem
              data-testid={`${mediaDeviceKind}-menu-item-${device.deviceId}`}
              onClick={() => {
                if (!device.deviceId) {
                  return;
                }

                void handleClick(device.deviceId);
              }}
              key={device.deviceId}
              selected={device.deviceId === localSource}
            >
              {device.label}
            </MenuItem>
          ))}

        {shouldDisplayEmptyState && (
          <MenuItem disabled data-testid={`${mediaDeviceKind}-menu-empty-state`}>
            {t('waitingRoom.devices.noDevicesFound')}
          </MenuItem>
        )}

        {mediaDeviceKind === 'audiooutput' &&
          (processedDevices.length > 0 ? (
            <SoundTest>
              <Box sx={{ mr: 1 }}>
                <VividIcon name="hearing-line" customSize={-5} />
              </Box>
            </SoundTest>
          ) : (
            <MenuItem disabled data-testid={`${mediaDeviceKind}-menu-empty-state`}>
              {t('waitingRoom.devices.noDevicesFound')}
            </MenuItem>
          ))}
      </Menu>

      <Snackbar
        open={!!cameraError}
        onClose={() => setCameraError(null)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={cameraError}
        action={
          <IconButton size="small" color="inherit" onClick={() => setCameraError(null)}>
            <VividIcon name="close-line" customSize={-6} />
          </IconButton>
        }
      />
    </>
  );
};

export default MenuDevices;
