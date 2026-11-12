import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, MenuList, MenuItem, Tooltip, BoxProps } from '@mui/material';
import classNames from 'classnames';
import VividIcon from '@ui/components/VividIcon';
import { useDistinctLabelMediaDevices } from '@ui/hooks';
import mediaDevices$ from '@core/stores/mediaDevices';
import useSelectDeviceHandler from '@hooks/useSelectDeviceHandler';
import { makeApplicationErrorMapper } from '@core/errors';
import { handleClientApplicationError } from '@ui/helpers';

export const testIds = {
  title: 'video-device-title',
  list: 'video-devices',
} as const;

export type VideoDevicesProps = BoxProps & {
  handleToggle: () => void;
};

/**
 * VideoDevices Component
 *
 * This component is responsible for rendering the list of video output devices (i.e. web cameras).
 * @param {VideoDevicesProps} props - the props for this component.
 *  @property {() => void} handleToggle - the function that handles the toggle of video output device.
 * @returns {ReactElement} - the video output devices component.
 */
const VideoDevices = ({
  handleToggle,
  className,
  ...boxProps
}: VideoDevicesProps): ReactElement => {
  const { t } = useTranslation();

  // Use store's selection as source of truth, not publisher.getVideoSource() which can be stale
  const selectedDeviceId = mediaDevices$.useDeviceId('videoinput');

  const devicesAvailable = useDistinctLabelMediaDevices('videoinput', (devices) =>
    devices.map((device) => ({
      ...device,
      label: device.label ?? t('unknown.device'),
    }))
  );

  const { handleSelectDevice } = useSelectDeviceHandler();

  const handleChangeVideoSource = async (deviceId: string) => {
    try {
      handleToggle();

      await handleSelectDevice({
        deviceId,
        mediaDeviceKind: 'videoinput',
      });
    } catch (error) {
      handleClientApplicationError(makeApplicationErrorMapper()(error));
    }
  };

  return (
    <Box className={className} {...boxProps}>
      <Box className="mb-1 ml-4 flex">
        <VividIcon name="video-line" customSize={-5} className="text-vera-text-secondary" />
        <p
          className="text-vera-body-extended text-vera-text-tertiary ml-4"
          data-testid={testIds.title}
        >
          {t('devices.video.camera.full')}
        </p>
      </Box>
      <MenuList id="split-button-menu" data-testid={testIds.list}>
        {devicesAvailable.map((option) => {
          const isSelected = option.deviceId === selectedDeviceId;
          return (
            <MenuItem
              key={option.deviceId}
              selected={isSelected}
              onClick={() => handleChangeVideoSource(option.deviceId)}
              className="[transition:background-color_160ms_ease]! [&.Mui-selected]:text-vera-on-background [&.Mui-selected]:bg-vera-background! [&:hover]:bg-vera-background!"
            >
              <Box
                key={`${option.deviceId}-video-device`}
                className={classNames('mb-1 flex w-full items-center overflow-hidden', {
                  'text-vera-text-primary': isSelected,
                  'text-vera-text-secondary': !isSelected,
                })}
              >
                {isSelected ? (
                  <Box key={'video-devices-check'} className="mr-5">
                    <VividIcon name="check-line" customSize={-6} />
                  </Box>
                ) : (
                  <Box className="min-w-9" /> // Placeholder when CheckIcon is not displayed
                )}
                <Tooltip title={option.label} placement="right" arrow>
                  <span className="text-vera-body-extended truncate">{option.label}</span>
                </Tooltip>
              </Box>
            </MenuItem>
          );
        })}
      </MenuList>
    </Box>
  );
};

export default VideoDevices;
