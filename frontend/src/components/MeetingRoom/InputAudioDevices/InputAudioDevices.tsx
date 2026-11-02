import { Box, MenuItem, MenuList, Tooltip } from '@mui/material';
import classNames from 'classnames';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import VividIcon from '@ui/components/VividIcon';
import { useDistinctLabelMediaDevices } from '@ui/hooks';
import mediaDevices$ from '@core/stores/mediaDevices';
import useSelectDeviceHandler from '@hooks/useSelectDeviceHandler';
import { handleClientApplicationError } from '@ui/helpers';
import { makeApplicationErrorMapper } from '@core/errors';

export const testIds = {
  title: 'input-device-title',
  list: 'input-devices',
} as const;

export type InputAudioDevicesProps = {
  handleToggle: () => void;
};

/**
 * InputAudioDevices Component
 *
 * Displays the audio input devices for a user. Handles switching audio input devices.
 * @param {InputAudioDevicesProps} props - The props for the component.
 *  @property {Function} handleToggle - The click handler to handle closing the menu.
 * @returns {ReactElement} - The InputAudioDevices component.
 */
const InputAudioDevices = ({ handleToggle }: InputAudioDevicesProps): ReactElement => {
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
    <div>
      <Box className="mb-1 ml-4 flex items-center">
        <VividIcon name="microphone-2-line" customSize={-6} />
        <p
          className="text-vera-body-extended text-vera-text-tertiary ml-4"
          data-testid={testIds.title}
        >
          {t('devices.audio.microphone.full')}
        </p>
      </Box>
      <MenuList data-testid={testIds.list}>
        {audioInputDevices.map((device) => {
          const isSelected = device.deviceId === selectedDeviceId;
          return (
            <MenuItem
              key={device.deviceId}
              selected={isSelected}
              onClick={() => handleChangeAudioSource(device.deviceId)}
              className="[transition:background-color_160ms_ease]! [&.Mui-selected]:text-vera-on-background [&.Mui-selected]:bg-vera-background! [&:hover]:bg-vera-background!"
            >
              <Box
                key={`${device.deviceId}-input-device`}
                className={classNames('mb-1 flex w-full items-center overflow-hidden', {
                  'text-vera-text-primary': isSelected,
                  'text-vera-text-secondary': !isSelected,
                })}
              >
                {isSelected ? (
                  <Box key={'input-audio-devices-check'} className="mr-5">
                    <VividIcon name="check-line" customSize={-6} />
                  </Box>
                ) : (
                  <Box className="min-w-9" />
                )}
                <Tooltip title={device.label} placement="right" arrow>
                  <span className="text-vera-body-extended truncate">{device.label}</span>
                </Tooltip>
              </Box>
            </MenuItem>
          );
        })}
      </MenuList>
    </div>
  );
};

export default InputAudioDevices;
