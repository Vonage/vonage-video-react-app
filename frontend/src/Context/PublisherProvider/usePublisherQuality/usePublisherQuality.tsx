import { useCallback, useEffect, useState } from 'react';
import { Publisher } from '@vonage/client-sdk-video';
import useUserContext from '../../../hooks/useUserContext';

export type NetworkQuality = 'good' | 'poor' | 'bad';

/**
 * React hook to return react state string of current publisher network quality.
 * This hook adds the necessary event listeners to publisher to assign state to one of 3 values:
 * 'good' | 'poor' | 'bad'.
 * Network quality state will be updated when events are triggered.
 * @param {(Publisher | null)} publisher - The publisher to monitor
 * @returns {NetworkQuality} network quality
 */
const usePublisherQuality = (publisher: Publisher | null): NetworkQuality => {
  const { user } = useUserContext();
  const [quality, setQuality] = useState<NetworkQuality>('good');

  const handleVideoDisabled = useCallback(() => {
    setQuality('bad');

    // eslint-disable-next-line react-hooks/immutability
    user.issues.audioFallbacks += 1;
  }, [user]);

  const handleVideoEnabled = useCallback(() => {
    setQuality('good');
  }, []);

  const handleVideoWarning = useCallback(() => {
    setQuality('poor');
  }, []);

  const handleVideoWarningLifted = useCallback(() => {
    setQuality('good');
  }, []);

  useEffect(() => {
    if (publisher) {
      publisher.on('videoDisabled', handleVideoDisabled);
      publisher.on('videoEnabled', handleVideoEnabled);
      publisher.on('videoDisableWarning', handleVideoWarning);
      publisher.on('videoDisableWarningLifted', handleVideoWarningLifted);
    }
  }, [
    handleVideoDisabled,
    handleVideoEnabled,
    handleVideoWarning,
    handleVideoWarningLifted,
    publisher,
  ]);

  return quality;
};

export default usePublisherQuality;
