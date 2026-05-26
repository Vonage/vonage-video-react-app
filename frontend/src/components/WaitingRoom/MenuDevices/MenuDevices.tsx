import { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import VividIcon from '@ui/VividIcon';
import Box from '@mui/material/Box';
import cleanAndDedupeDeviceLabels from '@utils/cleanAndDedupeDeviceLabels/cleanAndDedupeDeviceLabels';
import SoundTest from '../../SoundTest';
import { isGetActiveAudioOutputDeviceSupported } from '@utils/util';
import mediaDevices$ from '@core/stores/devices';
import useSelectDeviceHandler from '@hooks/useSelectDeviceHandler';
import { MediaDeviceInfoJSON } from '@web/types';
import { makeApplicationErrorMapper } from '@core/errors';
import { handleClientApplicationError } from '@ui/helpers';

export type MenuDevicesWaitingRoomProps = {
  onClose: () => void;
  open: boolean;
  mediaDeviceKind: MediaDeviceKind;
  anchorEl: HTMLElement | null;
};

/**
 * MenuDevices Component
 *
 * Displays a menu with the available media devices (audio input, audio output, video input) for the user to select
 */
const MenuDevices = ({
  mediaDeviceKind,
  onClose,
  open,
  anchorEl,
}: MenuDevicesWaitingRoomProps): ReactElement => {
  const { t } = useTranslation();

  const devices = mediaDevices$.useMediaDevices(
    mediaDeviceKind,
    Object.values<MediaDeviceInfoJSON>
  );

  const selectedDeviceId = mediaDevices$.useDeviceId(mediaDeviceKind);

  const processedDevices = useMemo(() => cleanAndDedupeDeviceLabels(devices), [devices]);

  const shouldDisplayDevices =
    mediaDeviceKind !== 'audiooutput' || isGetActiveAudioOutputDeviceSupported();

  const shouldDisplayEmptyState = shouldDisplayDevices && processedDevices.length === 0;

  const { handleSelectDevice } = useSelectDeviceHandler();

  const applicationErrorMapper = makeApplicationErrorMapper();

  return (
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      slotProps={{ list: { 'aria-labelledby': 'basic-button' } }}
      data-testid={`${mediaDeviceKind}-menu`}
    >
      {shouldDisplayDevices &&
        processedDevices.map(({ deviceId, label }) => (
          <MenuItem
            data-testid={`${mediaDeviceKind}-menu-item-${deviceId}`}
            onClick={async () => {
              try {
                onClose();

                await handleSelectDevice({ mediaDeviceKind, deviceId });
              } catch (error) {
                handleClientApplicationError(applicationErrorMapper(error));
              }
            }}
            key={deviceId}
            selected={deviceId === selectedDeviceId}
          >
            {label}
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
  );
};

export default MenuDevices;
