import { ReactElement, MouseEvent, TouchEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import useDevices from '@hooks/useDevices';
import useAudioOutputContext from '@hooks/useAudioOutputContext';
import useIsSmallViewport from '@hooks/useIsSmallViewport';
import useAppConfig from '@Context/AppConfig/hooks/useAppConfig';
import Box from '@ui/Box';
import { SxProps } from '@ui/SxProps';
import useCustomTheme from '@Context/Theme';
import VividIcon from '@components/VividIcon';
import ButtonBase from '@ui/ButtonBase';
import MenuDevicesWaitingRoom from '../MenuDevices';
import MenuMoreOptions from '../MenuMoreOptions/MenuMoreOptions';

export type ControlPanelProps = {
  handleAudioInputOpen: (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => void;
  handleVideoInputOpen: (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => void;
  handleAudioOutputOpen: (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => void;
  handleClose: () => void;
  openVideoInput: boolean;
  openAudioInput: boolean;
  openAudioOutput: boolean;
  anchorEl: HTMLElement | null;
};

/**
 * ControlPanel Component
 *
 * Displays drop-down menus to change the user's audio input, audio output, and video input devices.
 * @param {ControlPanelProps} props - The props for the component.
 *  @property {Function} handleAudioInputOpen - Function to open the audio input menu.
 *  @property {Function} handleVideoInputOpen - Function to open the video input menu.
 *  @property {Function} handleAudioOutputOpen - Function to open the audio output menu.
 *  @property {() => void} handleClose - Function to close the menu.
 *  @property {boolean} openVideoInput - Whether the video input menu is open.
 *  @property {boolean} openAudioInput - Whether the audio input menu is open.
 *  @property {boolean} openAudioOutput- Whether the audio output menu is open.
 *  @property {HTMLElement | null} anchorEl - The reference element for the ControlPanel component.
 * @returns {ReactElement} - The ControlPanel component.
 */
const ControlPanel = ({
  handleAudioInputOpen,
  handleVideoInputOpen,
  handleAudioOutputOpen,
  handleClose,
  openVideoInput,
  openAudioInput,
  openAudioOutput,
  anchorEl,
}: ControlPanelProps): ReactElement | false => {
  const [openMoreOptions, setOpenMoreOptions] = useState(false);
  const [moreOptionsAnchorEl, setMoreOptionsAnchorEl] = useState<HTMLElement | null>(null);
  const handleCloseMoreOptions = () => {
    setOpenMoreOptions(false);
    setMoreOptionsAnchorEl(null);
  };
  const handleOpenMoreOptions = (event: MouseEvent<HTMLElement>) => {
    setMoreOptionsAnchorEl(event.currentTarget);
    setOpenMoreOptions(true);
  };

  const { t } = useTranslation();
  const isSmallViewport = useIsSmallViewport();
  const { allMediaDevices } = useDevices();
  const { localAudioSource, localVideoSource, changeAudioSource, changeVideoSource } =
    usePreviewPublisherContext();
  const { currentAudioOutputDevice, setAudioOutputDevice } = useAudioOutputContext();
  const theme = useCustomTheme();

  const allowDeviceSelection = useAppConfig(
    ({ waitingRoomSettings }) => waitingRoomSettings.allowDeviceSelection
  );

  const buttonSx: SxProps = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    borderRadius: theme.shapes.borderRadiusMedium,
    padding: '8px',
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weight.caption.value,
    fontSize: theme.typography.typeScale.desktop['body-base'].fontSize.value,

    minWidth: 0,

    '&:hover': {
      backgroundColor: theme.colors.background,
    },
  };

  const textSx: SxProps = {
    flex: '1 1 0',
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    allowDeviceSelection && (
      <Box
        sx={{
          my: 4,
          maxWidth: '100vw',
        }}
        data-testid="ControlPanel"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 4px',
          }}
        >
          <ButtonBase
            sx={buttonSx}
            aria-controls={openVideoInput ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openVideoInput ? 'true' : undefined}
            onClick={handleAudioInputOpen}
          >
            <VividIcon name="microphone-line" customSize={-6} />
            <Box component="span" sx={textSx}>
              {isSmallViewport
                ? t('devices.audio.microphone.short')
                : t('devices.audio.microphone.full')}
            </Box>
            <VividIcon name="chevron-down-line" customSize={-6} />
          </ButtonBase>
          <MenuDevicesWaitingRoom
            devices={allMediaDevices.audioInputDevices}
            open={openAudioInput}
            onClose={handleClose}
            anchorEl={anchorEl}
            localSource={localAudioSource}
            deviceChangeHandler={changeAudioSource}
            deviceType="audioInput"
          />

          <ButtonBase
            onClick={handleVideoInputOpen}
            sx={buttonSx}
            aria-label={t('devices.video.camera.button.ariaLabel')}
          >
            <VividIcon name="audio-off-2-line" customSize={-6} />
            <Box component="span" sx={textSx}>
              {t('button.camera')}
            </Box>
            <VividIcon name="chevron-down-line" customSize={-6} />
          </ButtonBase>
          <MenuDevicesWaitingRoom
            devices={allMediaDevices.videoInputDevices}
            open={openVideoInput}
            onClose={handleClose}
            anchorEl={anchorEl}
            localSource={localVideoSource}
            deviceChangeHandler={changeVideoSource}
            deviceType="videoInput"
          />

          <ButtonBase onClick={handleAudioOutputOpen} sx={buttonSx}>
            <VividIcon name="video-line" customSize={-6} />
            <Box component="span" sx={textSx}>
              {t('button.speaker')}
            </Box>
            <VividIcon name="chevron-down-line" customSize={-6} />
          </ButtonBase>
          <MenuDevicesWaitingRoom
            devices={allMediaDevices.audioOutputDevices}
            open={openAudioOutput}
            onClose={handleClose}
            anchorEl={anchorEl}
            localSource={currentAudioOutputDevice}
            deviceChangeHandler={setAudioOutputDevice}
            deviceType="audioOutput"
          />

          <ButtonBase onClick={handleOpenMoreOptions} sx={buttonSx}>
            <VividIcon name="more-vertical-solid" customSize={-5} />
          </ButtonBase>
          <MenuMoreOptions
            onClose={handleCloseMoreOptions}
            open={openMoreOptions}
            anchorEl={moreOptionsAnchorEl}
          />
        </Box>
      </Box>
    )
  );
};

export default ControlPanel;
