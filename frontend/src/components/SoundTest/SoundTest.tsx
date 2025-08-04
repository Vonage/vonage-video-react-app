import { MenuItem, Typography, ClickAwayListener } from '@mui/material';
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAudioOutputContext from '../../hooks/useAudioOutputContext';

export type SoundTestProps = {
  children: ReactElement;
};

/**
 * SoundTest
 *
 * Renders a menu item to test the speakers by playing a sound through the active audio output device.
 * @param {SoundTestProps} props - The props for the component.
 *  @property {ReactElement} children - The icon to be rendered for the sound test.
 * @returns {ReactElement} The SoundTest component
 */
const SoundTest = ({ children }: SoundTestProps): ReactElement => {
  const { t } = useTranslation();
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const audioElement = useMemo(() => new Audio('/sound.mp3'), []);
  const { currentAudioOutputDevice } = useAudioOutputContext();

  const stopAudio = useCallback(() => {
    audioElement.pause();
    audioElement.currentTime = 0;
    setAudioIsPlaying(false);
  }, [audioElement]);

  useEffect(() => {
    if (currentAudioOutputDevice) {
      audioElement.setSinkId?.(currentAudioOutputDevice);
    }
  }, [audioElement, currentAudioOutputDevice]);

  const handlePlayAudio = useCallback(() => {
    if (!audioIsPlaying) {
      audioElement.play();
      setAudioIsPlaying(true);
    } else {
      // Stop playing the audio and reset the playback to the beginning of the track.
      stopAudio();
    }
  }, [audioElement, audioIsPlaying, stopAudio]);

  return (
    <ClickAwayListener onClickAway={() => stopAudio()}>
      <MenuItem onClick={handlePlayAudio} data-testid="soundTest">
        {children}
        <Typography noWrap>
          {!audioIsPlaying ? t('soundTest.start') : t('soundTest.stop')}
        </Typography>
      </MenuItem>
    </ClickAwayListener>
  );
};

export default SoundTest;
