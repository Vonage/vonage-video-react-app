import { useMemo } from 'react';
import { PublisherProperties, VideoFilter, AudioFilter } from '@vonage/client-sdk-video';
import hasMediaProcessorSupport from '@utils/hasMediaProcessorSupport/hasMediaProcessorSupport';
import useUserContext from '@hooks/useUserContext';
import getInitials from '@utils/getInitials';
import { useDeviceId } from '@core/stores/mediaDevices/hooks';
import useStableCallback from '@web/hooks/useStableCallback';
import type { DeniedDevices } from '@utils/publisher/deviceAccess';
import { NO_DENIED_DEVICES } from '@utils/publisher/deviceAccess';
import { env } from '../../../env';
import advancedSettings$ from '@Context/AdvancedSettings';

/**
 * React hook to get PublisherProperties combining default options and options set in UserContext
 * @returns {PublisherProperties | null} publisher properties object
 */

const usePublisherOptions = ({
  isAudioEnabled,
  isVideoEnabled,
  deniedDevices = NO_DENIED_DEVICES,
}: {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  deniedDevices?: DeniedDevices;
}): PublisherProperties => {
  const { user } = useUserContext();
  // Read as primitives so the memo below stays stable across the fresh `deniedDevices` object
  // identity produced on every render.
  const isMicrophoneBlocked = deniedDevices.microphone;
  const isCameraBlocked = deniedDevices.camera;
  const enableDtx = advancedSettings$.use.select((state) => state.enableDtx);
  const frameRate = advancedSettings$.use.select((state) => state.frameRate);
  const codecMode = advancedSettings$.use.select((state) => state.codecMode);
  const codecPriority = advancedSettings$.use.select((state) => state.codecPriority);
  const publisherAudioFallbackEnabled = advancedSettings$.use.select(
    (state) => state.publisherAudioFallbackEnabled
  );
  const subscriberAudioFallbackEnabled = advancedSettings$.use.select(
    (state) => state.subscriberAudioFallbackEnabled
  );

  // Extract individual properties to avoid object reference changes
  const { name, noiseSuppression, backgroundFilter, publishAudio, publishVideo, publishCaptions } =
    user.defaultSettings;

  const videoSource = useDeviceId('videoinput');
  const audioSource = useDeviceId('audioinput');

  const getOptions = useStableCallback(() => {
    const initials = getInitials(name);

    const audioFilter: AudioFilter | undefined =
      noiseSuppression && hasMediaProcessorSupport('both')
        ? { type: 'advancedNoiseSuppression' }
        : undefined;

    const videoFilter: VideoFilter | undefined =
      backgroundFilter && hasMediaProcessorSupport('both') ? backgroundFilter : undefined;

    const options = {
      audioFallback: {
        publisher: publisherAudioFallbackEnabled,
        subscriber: subscriberAudioFallbackEnabled,
      },
      audioFilter,
      // Exclude a blocked device from the source, not just from publishAudio/publishVideo (which
      // only start it muted while the SDK still acquires it). Passing a blocked device's id makes
      // the single combined getUserMedia fail wholesale, leaving the granted camera dark. `false`
      // skips acquiring that track so the granted device still comes up (Google Meet style).
      audioSource: isMicrophoneBlocked ? false : audioSource,
      enableDtx,
      initials,
      insertDefaultUI: false,
      name,
      publishAudio:
        env.ALLOW_AUDIO_ON_JOIN && publishAudio && isAudioEnabled && !isMicrophoneBlocked,
      publishCaptions,
      publishVideo: env.ALLOW_VIDEO_ON_JOIN && publishVideo && isVideoEnabled && !isCameraBlocked,
      frameRate,
      preferredVideoCodecs: (codecMode === 'automatic'
        ? 'automatic'
        : codecPriority) as PublisherProperties['preferredVideoCodecs'],
      resolution: env.PUBLISHER_MAX_RESOLUTION,
      videoFilter,
      videoSource: isCameraBlocked ? false : videoSource,
      publishSenderStats: env.MEETING_ROOM_ALLOW_ADVANCED_SETTINGS,
    };

    return options;
  });

  return useMemo(
    () => getOptions(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      getOptions,
      audioSource,
      backgroundFilter,
      enableDtx,
      name,
      noiseSuppression,
      publishAudio,
      publishCaptions,
      publishVideo,
      videoSource,
      isAudioEnabled,
      isVideoEnabled,
      isMicrophoneBlocked,
      isCameraBlocked,
      frameRate,
      codecMode,
      codecPriority,
      publisherAudioFallbackEnabled,
      subscriberAudioFallbackEnabled,
    ]
  );
};

export default usePublisherOptions;
