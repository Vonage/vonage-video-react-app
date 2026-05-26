import { Box, MenuItem, MenuList, Tooltip } from '@mui/material';
import classNames from 'classnames';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import VividIcon from '@ui/VividIcon';
import { useDistinctLabelMediaDevices } from '@ui/hooks';
import mediaDevices$ from '@core/stores/devices';
import { env } from '../../../env';
import useSelectDeviceHandler from '@hooks/useSelectDeviceHandler';
import { handleClientApplicationError } from '@ui/helpers';
import { makeApplicationErrorMapper } from '@core/errors';

export type InputAudioDevicesProps = {
  handleToggle: () => void;
};

/**
 * InputAudioDevices Component
 *
 * Displays the audio input devices for a user. Handles switching audio input devices.
 * @param {InputAudioDevicesProps} props - The props for the component.
 *  @property {Function} handleToggle - The click handler to handle closing the menu.
 * @returns {ReactElement | false} - The InputAudioDevices component.
 */
const InputAudioDevices = ({ handleToggle }: InputAudioDevicesProps): ReactElement | false => {
  const { t } = useTranslation();

  // Use store's selection as source of truth, not publisher.getAudioSource() which can be stale
  const selectedDeviceId = mediaDevices$.useDeviceId('audioinput');

  const audioInputDevices = useDistinctLabelMediaDevices('audioinput', (devices) =>
    devices.map((device) => ({
      ...device,
      label: device.label || t('unknown.device'),
    }))
  );

  const { handleSelectDevice } = useSelectDeviceHandler();

  const handleChangeAudioSource = async (deviceId: string) => {
    try {
      handleToggle();

      await handleSelectDevice({
        deviceId,
        mediaDeviceKind: 'audioinput',
      });
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper()(error));
    }
  };

  return (
    env.MEETING_ROOM_ALLOW_DEVICE_SELECTION && (
      <>
        <Box
          className="text-vera-tertiary"
          sx={{
            display: 'flex',
            alignItems: 'center',
            ml: 2,
            mt: 1,
            mb: 0.5,
          }}
        >
          <VividIcon
            name="microphone-2-line"
            customSize={-6}
            style={{ color: 'var(--vera-text-secondary) !important' }}
          />
          <p className="text-vera-body-extended ml-4">{t('devices.audio.microphone.full')}</p>
        </Box>
        <MenuList>
          {audioInputDevices.map((device) => {
            const isSelected = device.deviceId === selectedDeviceId;
            return (
              <MenuItem
                key={device.deviceId}
                selected={isSelected}
                onClick={() => handleChangeAudioSource(device.deviceId)}
                className="[&.Mui-selected]:text-vera-on-background"
                sx={{
                  transition: 'background-color 160ms ease',
                  '&&.Mui-selected': {
                    backgroundColor: 'var(--vera-background)',
                  },
                  '&&.Mui-selected:hover': {
                    backgroundColor: 'var(--vera-background)',
                  },
                  '&&:hover': {
                    backgroundColor: 'var(--vera-background)',
                  },
                }}
              >
                <Box
                  key={`${device.deviceId}-input-device`}
                  className={classNames('w-full items-center', {
                    'text-vera-text-primary': isSelected,
                    'text-vera-text-secondary': !isSelected,
                  })}
                  sx={{
                    display: 'flex',
                    mb: 0.5,
                    overflow: 'hidden',
                  }}
                >
                  {isSelected ? (
                    <Box key={'input-audio-devices-check'} sx={{ mr: 2.5 }}>
                      <VividIcon
                        name="check-line"
                        customSize={-6}
                        style={{
                          color: `${
                            isSelected ? 'var(--vera-text-primary)' : 'var(--vera-text-secondary)'
                          } !important`,
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ minWidth: 36 }} />
                  )}
                  <Tooltip title={device.label} placement="right" arrow>
                    <span className="text-vera-body-extended truncate">{device.label}</span>
                  </Tooltip>
                </Box>
              </MenuItem>
            );
          })}
        </MenuList>
      </>
    )
  );
};

export default InputAudioDevices;
