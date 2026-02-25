import { useMemo } from 'react';
import {
  PublisherProperties,
  VideoFilter,
  AudioFilter,
  hasMediaProcessorSupport,
} from '@vonage/client-sdk-video';
import appConfig$ from '@stores/appConfig';
import useUserContext from '@hooks/useUserContext';
import getInitials from '@utils/getInitials';
import { useDeviceId } from '@core/stores/devices/hooks';
import useStableCallback from '@web/hooks/useStableCallback';

/**
 * React hook to get PublisherProperties combining default options and options set in UserContext
 * @returns {PublisherProperties | null} publisher properties object
 */

const usePublisherOptions = ({
  isAudioEnabled,
  isVideoEnabled,
}: {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
}): PublisherProperties => {
  const { user } = useUserContext();

  const defaultResolution = appConfig$.use.select(
    ({ videoSettings }) => videoSettings.defaultResolution
  );
  const allowVideoOnJoin = appConfig$.use.select(
    ({ videoSettings }) => videoSettings.allowVideoOnJoin
  );
  const allowAudioOnJoin = appConfig$.use.select(
    ({ audioSettings }) => audioSettings.allowAudioOnJoin
  );

  // Extract individual properties to avoid object reference changes
  const { name, noiseSuppression, backgroundFilter, publishAudio, publishVideo, publishCaptions } =
    user.defaultSettings;

  const videoSource = useDeviceId('videoinput');
  const audioSource = useDeviceId('audioinput');

  const getOptions = useStableCallback(() => {
    const initials = getInitials(name);

    const audioFilter: AudioFilter | undefined =
      noiseSuppression && hasMediaProcessorSupport()
        ? { type: 'advancedNoiseSuppression' }
        : undefined;

    const videoFilter: VideoFilter | undefined =
      backgroundFilter && hasMediaProcessorSupport() ? backgroundFilter : undefined;

    const options = {
      audioFallback: { publisher: true },
      audioFilter,
      audioSource,
      initials,
      insertDefaultUI: false,
      name,
      publishAudio: allowAudioOnJoin && publishAudio && isAudioEnabled,
      publishCaptions,
      publishVideo: allowVideoOnJoin && publishVideo && isVideoEnabled,
      resolution: defaultResolution,
      videoFilter,
      videoSource,
    };

    return options;
  });

  return useMemo(
    () => getOptions(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      getOptions,
      allowAudioOnJoin,
      allowVideoOnJoin,
      audioSource,
      backgroundFilter,
      defaultResolution,
      name,
      noiseSuppression,
      publishAudio,
      publishCaptions,
      publishVideo,
      videoSource,
      isAudioEnabled,
      isVideoEnabled,
    ]
  );
};

export default usePublisherOptions;
