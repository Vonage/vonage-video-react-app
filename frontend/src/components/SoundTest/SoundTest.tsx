import { MenuItem, Typography } from '@mui/material';
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
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
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const audio = useMemo(() => new Audio('/sound.mp3'), []);
  const { audioOutput } = useAudioOutputContext();

  useEffect(() => {
    if (audioOutput) {
      audio.setSinkId?.(audioOutput);
    }
  }, [audio, audioOutput]);

  const handlePlayAudio = useCallback(() => {
    if (!audioIsPlaying) {
      audio.play();
      setAudioIsPlaying(true);
    } else {
      // Stop playing the audio and reset the playback to the beginning of the track.
      audio.pause();
      audio.currentTime = 0;
      setAudioIsPlaying(false);
    }
  }, [audio, audioIsPlaying]);

  return (
    <MenuItem onClick={handlePlayAudio} data-testid="soundTest">
      {children}
      <Typography noWrap>{!audioIsPlaying ? 'Test speakers' : 'Stop testing'}</Typography>
    </MenuItem>
  );
};

export default SoundTest;
