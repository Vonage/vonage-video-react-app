import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuItem from '@mui/material/MenuItem';
import useTheme from '@ui/theme';
import { mediaDevices$ } from '@core/stores';

export type SoundTestProps = {
  children: ReactElement;
  isFromMeetingRoom?: boolean;
};

/**
 * SoundTest
 *
 * Renders a menu item to test the speakers by playing a sound through the active audio output device.
 * @param {SoundTestProps} props - The props for the component.
 *  @property {ReactElement} children - The icon to be rendered for the sound test.
 * @returns {ReactElement} The SoundTest component
 */
const SoundTest = ({ children, isFromMeetingRoom = false }: SoundTestProps): ReactElement => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const audioElement = useMemo(() => new Audio('/sound.mp3'), []);
  const currentAudioOutputDevice = mediaDevices$.useDeviceId('audiooutput');

  const stopAudio = useCallback(() => {
    audioElement.pause();

    // eslint-disable-next-line react-hooks/immutability
    audioElement.currentTime = 0;
    setAudioIsPlaying(false);
  }, [audioElement]);

  useEffect(() => {
    if (currentAudioOutputDevice) {
      void audioElement.setSinkId?.(currentAudioOutputDevice);
    }
  }, [audioElement, currentAudioOutputDevice]);

  const handlePlayAudio = useCallback(() => {
    if (!audioIsPlaying) {
      void audioElement.play();
      setAudioIsPlaying(true);
    } else {
      // Stop playing the audio and reset the playback to the beginning of the track.
      stopAudio();
    }
  }, [audioElement, audioIsPlaying, stopAudio]);

  return (
    <ClickAwayListener onClickAway={() => stopAudio()}>
      <MenuItem
        onClick={handlePlayAudio}
        data-testid="soundTest"
        sx={{
          '&:hover': {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        {children}
        <span
          data-testid="soundTestLabel"
          className={
            isFromMeetingRoom
              ? 'text-vera-heading-4 font-vera-body-base md:text-[1.125rem] md:leading-6'
              : 'text-vera-body-base'
          }
        >
          {!audioIsPlaying ? t('soundTest.start') : t('soundTest.stop')}
        </span>
      </MenuItem>
    </ClickAwayListener>
  );
};

export default SoundTest;
