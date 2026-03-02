import { ReactElement, MouseEvent, TouchEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import useIsSmallViewport from '@hooks/useIsSmallViewport';
import Box from '@mui/material/Box';
import type { SxProps } from '@mui/material';
import useTheme from '@ui/theme';
import VividIcon from '@components/VividIcon';
import ButtonBase from '@mui/material/ButtonBase';
import MenuDevicesWaitingRoom from '../MenuDevices';
import MenuMoreOptions from '../MenuMoreOptions/MenuMoreOptions';
import { mediaDevices$ } from '@core/stores';

const textSx: SxProps = {
  flex: '1 1 0',
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

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

  const { changeAudioSource, changeVideoSource } = usePreviewPublisherContext();

  const theme = useTheme();

  const buttonSx: SxProps = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    '&:hover': {
      backgroundColor: theme.colors.background,
    },
    color: theme.colors.textSecondary,
  };

  return (
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
          aria-controls={openAudioInput ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openAudioInput ? 'true' : undefined}
          aria-label={t('devices.audio.microphone.ariaLabel')}
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
          mediaDeviceKind="audioinput"
          open={openAudioInput}
          onClose={handleClose}
          anchorEl={anchorEl}
          deviceChangeHandler={changeAudioSource}
        />

        <ButtonBase
          onClick={handleVideoInputOpen}
          sx={buttonSx}
          aria-controls={openVideoInput ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openVideoInput ? 'true' : undefined}
          aria-label={t('devices.video.camera.ariaLabel')}
        >
          <VividIcon name="video-line" customSize={-6} />
          <Box component="span" sx={textSx}>
            {t('button.camera')}
          </Box>
          <VividIcon name="chevron-down-line" customSize={-6} />
        </ButtonBase>

        <MenuDevicesWaitingRoom
          mediaDeviceKind="videoinput"
          open={openVideoInput}
          onClose={handleClose}
          anchorEl={anchorEl}
          deviceChangeHandler={changeVideoSource}
        />

        <ButtonBase
          onClick={handleAudioOutputOpen}
          sx={buttonSx}
          aria-controls={openAudioOutput ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={openAudioOutput ? 'true' : undefined}
          aria-label={t('devices.audio.speakers.full')}
        >
          <VividIcon name="audio-off-2-line" customSize={-6} />
          <Box component="span" sx={textSx}>
            {t('button.speaker')}
          </Box>
          <VividIcon name="chevron-down-line" customSize={-6} />
        </ButtonBase>

        <MenuDevicesWaitingRoom
          mediaDeviceKind="audiooutput"
          open={openAudioOutput}
          onClose={handleClose}
          anchorEl={anchorEl}
          deviceChangeHandler={(deviceId) => {
            void mediaDevices$.actions.selectDevice('audiooutput', deviceId);
          }}
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
  );
};

export default ControlPanel;
