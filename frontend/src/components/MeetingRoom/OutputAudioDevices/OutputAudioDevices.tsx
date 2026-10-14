import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { MediaDeviceInfoJSON } from '@web/types';
import classNames from 'classnames';
import Box from '@mui/material/Box';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import VividIcon from '@ui/components/VividIcon';
import { useDistinctLabelMediaDevices } from '@ui/hooks';
import { isSinkIdSupported } from '@web/platform';
import mediaDevices$ from '@core/stores/mediaDevices';
import { Tooltip } from '@mui/material';
import useSelectDeviceHandler from '@hooks/useSelectDeviceHandler';
import { makeApplicationErrorMapper } from '@core/errors';
import { handleClientApplicationError } from '@ui/helpers';

export const testIds = {
  title: 'output-device-title',
  list: 'output-devices',
} as const;

export type OutputAudioDevicesProps = {
  handleToggle: () => void;
};

/**
 * OutputAudioDevices Component
 *
 * Displays and switches audio output devices.
 * @param {OutputAudioDevicesProps} props - The props for the component.
 *  @property {() => void} handleToggle - Function to close the menu.
 * @returns {ReactElement} - The OutputAudioDevices component.
 */
const OutputAudioDevices = ({ handleToggle }: OutputAudioDevicesProps): ReactElement => {
  const { t } = useTranslation();
  const currentAudioOutputId = mediaDevices$.useDeviceId('audiooutput');

  const availableDevices = useDistinctLabelMediaDevices('audiooutput', (devices) =>
    isSinkIdSupported()
      ? devices.map((device) =>
          // Rename default audio output device to user-friendly label
          device.deviceId === 'default'
            ? { ...device, label: t('devices.audio.defaultLabel') }
            : device
        )
      : [{ deviceId: 'default', label: t('devices.audio.defaultLabel') } as MediaDeviceInfoJSON]
  );

  const { handleSelectDevice } = useSelectDeviceHandler();

  const handleChangeAudioOutput = async (deviceId: string) => {
    try {
      handleToggle();

      if (!isSinkIdSupported()) return;

      await handleSelectDevice({
        deviceId,
        mediaDeviceKind: 'audiooutput',
      });
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper()(error));
    }
  };

  return (
    <>
      <Box className="mt-4 mb-1 ml-4 flex items-center">
        <VividIcon
          name="audio-mid-line"
          customSize={-5}
          style={{ color: 'var(--vera-text-secondary) !important' }}
        />
        <p
          className="text-vera-body-extended text-vera-text-tertiary ml-4"
          data-testid={testIds.title}
        >
          {t('devices.audio.speakers.full')}
        </p>
      </Box>

      <MenuList data-testid={testIds.list}>
        {availableDevices?.map((device: MediaDeviceInfoJSON) => {
          // If audio output device selection is not supported we show the default device as selected
          const isSelected =
            device.deviceId === currentAudioOutputId || availableDevices.length === 1;

          return (
            <MenuItem
              key={device.deviceId}
              selected={isSelected}
              onClick={() => handleChangeAudioOutput(device.deviceId)}
              className="[transition:background-color_160ms_ease] [&.Mui-selected]:text-vera-on-background [&.Mui-selected]:bg-vera-background! [&:hover]:bg-vera-background!"
            >
              <Box
                key={`${device.deviceId}-input-device`}
                className={classNames('mb-1 flex w-full items-center overflow-hidden', {
                  'text-vera-text-primary': isSelected,
                  'text-vera-text-secondary': !isSelected,
                })}
              >
                {isSelected ? (
                  <Box key={'output-audio-devices-check'} className="mr-5">
                    <VividIcon
                      name="check-line"
                      customSize={-6}
                      style={{
                        color: isSelected
                          ? 'var(--vera-text-primary)'
                          : 'var(--vera-text-secondary)',
                      }}
                    />
                  </Box>
                ) : (
                  <Box className="min-w-[36px]" />
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
  );
};

export default OutputAudioDevices;
