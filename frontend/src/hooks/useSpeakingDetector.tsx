import { useState, useEffect, useRef } from 'react';
import SpeakingDetector from '../utils/SpeakingDetector';
import useConfigContext from './useConfigContext';

export type UseSpeakingDetectorOptions = {
  selectedMicrophoneId: string | undefined;
  isAudioEnabled: boolean;
};
/**
 * A react hook wrapper for the SpeakingDetector util
 * @param {UseSpeakingDetectorOptions} props - the props for this component
 *  @property {boolean} isAudioEnabled - current publisher audio state
 *  @property {string | undefined} selectedMicrophoneId - current publisher microphone device id
 * @returns {boolean} isSpeakingWhileMuted - boolean indicating whether speaking is detected while publisher is muted
 */
const useSpeakingDetector = ({
  selectedMicrophoneId,
  isAudioEnabled,
}: UseSpeakingDetectorOptions): boolean => {
  const allowMicrophoneControl = useConfigContext(
    ({ audioSettings }) => audioSettings.allowMicrophoneControl
  );

  const [isSpeakingWhileMuted, setIsSpeakingWhileMuted] = useState(false);
  const speakingDetectorRef = useRef<SpeakingDetector | null>(null);

  useEffect(() => {
    if (!allowMicrophoneControl || isAudioEnabled) {
      return undefined;
    }
    speakingDetectorRef.current = new SpeakingDetector({
      selectedMicrophoneId,
    });
    speakingDetectorRef.current.turnSpeakingDetectorOn();

    const handleSpeakingWhileMuted = () => {
      setIsSpeakingWhileMuted(true);
    };

    const handleMuteIndicationOff = () => {
      setIsSpeakingWhileMuted(false);
    };

    const speakingDetector = speakingDetectorRef.current;

    // Subscribe to events
    speakingDetector.on('isSpeakingWhileMuted', handleSpeakingWhileMuted);
    speakingDetector.on('isSpeakingWhileMutedOff', handleMuteIndicationOff);

    return () => {
      // Cleanup and unsubscribe from events
      if (speakingDetectorRef.current) {
        speakingDetectorRef.current.cleanup();
        speakingDetectorRef.current.off('isSpeakingWhileMuted', handleSpeakingWhileMuted);
        speakingDetectorRef.current.off('isSpeakingWhileMutedOff', handleMuteIndicationOff);
        speakingDetectorRef.current = null;
        setIsSpeakingWhileMuted(false);
      }
    };
  }, [allowMicrophoneControl, selectedMicrophoneId, isAudioEnabled]);

  return isSpeakingWhileMuted;
};

export default useSpeakingDetector;
