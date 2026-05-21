import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Box from '@mui/material/Box';
import { mediaDevices$ } from '@core/stores';
import { twMerge } from 'tailwind-merge';

export type SoundTestProps = {
  children: ReactElement;
  labelClassName?: string;
};

/**
 * SoundTest
 *
 * Renders a clickable row to test the speakers by playing a sound through the active audio output device.
 * @param {SoundTestProps} props - The props for the component.
 *  @property {ReactElement} children - The icon to be rendered for the sound test.
 *  @property {string} labelClassName - Additional Tailwind classes for the label.
 * @returns {ReactElement} The SoundTest component
 */
const SoundTest = ({ children, labelClassName }: SoundTestProps): ReactElement => {
  const { t } = useTranslation();
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const audioElement = useMemo(() => new Audio('/assets/sound.mp3'), []);
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
      <Box
        component="button"
        type="button"
        onClick={handlePlayAudio}
        data-testid="soundTest"
        className="flex w-full items-center rounded-none border-0 bg-transparent px-4 py-1.5 text-left hover:bg-vera-background"
      >
        {children}
        <span
          data-testid="soundTestLabel"
          className={twMerge('font-vera-plain text-vera-body-base', labelClassName)}
        >
          {!audioIsPlaying ? t('soundTest.start') : t('soundTest.stop')}
        </span>
      </Box>
    </ClickAwayListener>
  );
};

export default SoundTest;
