import { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react';
import throttle from '@common/execution/throttle';
import usePublisherContext from './usePublisherContext';
import createMovingAvgAudioLevelTracker from '../utils/movingAverageAudioLevelTracker'; // Adjust import as needed

/**
 * Creates a function to handle audio level updates using a moving average tracker.
 * @param {Dispatch<SetStateAction<number>>} setAudioLevel - Function to update the audio level state.
 * @returns {(params: { audioLevel: number }) => void} A handler function that processes and sets the audio level.
 */
const createOnHandleAudioLevelUpdated = (setAudioLevel: Dispatch<SetStateAction<number>>) => {
  // Initialize moving average audio level tracker
  const getMovingAverageAudioLevel = createMovingAvgAudioLevelTracker();

  // Throttled function to handle audio level updates
  const throttledUpdateAudioLevel = throttle(
    (audioLevel: number) => {
      const { logMovingAvg } = getMovingAverageAudioLevel(audioLevel);
      setAudioLevel(logMovingAvg * 100); // Set the audio level state
    },
    100,
    { leading: true, trailing: true }
  );

  /**
   * Handles the raw audio level and updates it using the throttled function.
   * @param {number} audioLevel - The raw audio level to process.
   */
  const handleAudioLevel = (audioLevel: number) => {
    throttledUpdateAudioLevel(audioLevel);
  };

  return ({ audioLevel }: { audioLevel: number }) => {
    handleAudioLevel(audioLevel);
  };
};

/**
 * Custom hook to track and return the current audio level of the publisher.
 *
 * This hook listens to audio level updates from the publisher and processes them
 * using a moving average to smooth out fluctuations. It returns the current audio level as a percentage.
 * @returns {number} The current audio level as a percentage (0-100).
 */
const useAudioLevels = () => {
  const { publisher, isPublishing } = usePublisherContext();
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const audioLevelUpdateHandler = useMemo(
    () => createOnHandleAudioLevelUpdated(setAudioLevel),
    [setAudioLevel]
  );

  useEffect(() => {
    if (isPublishing && publisher) {
      publisher.on('audioLevelUpdated', audioLevelUpdateHandler);
    }
    return () => {
      if (isPublishing && publisher) {
        publisher.off('audioLevelUpdated', audioLevelUpdateHandler);
      }
    };
  }, [isPublishing, publisher, audioLevelUpdateHandler]);

  return audioLevel;
};

export default useAudioLevels;
