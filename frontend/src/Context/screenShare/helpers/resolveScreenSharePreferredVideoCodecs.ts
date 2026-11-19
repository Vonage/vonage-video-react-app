import type { PublisherProperties } from '@vonage/client-sdk-video';
import {
  ADVANCED_SETTINGS_CODEC_MODE,
  ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE,
} from '@components/AdvancedSettingsDialog/schemas';
import type {
  AdvancedSettingsCodecMode,
  AdvancedSettingsManualCodecOrder,
  AdvancedSettingsScreenShareCodecMode,
} from '@components/AdvancedSettingsDialog/schemas';

type ResolveScreenSharePreferredVideoCodecsArgs = {
  screenShareCodecMode: AdvancedSettingsScreenShareCodecMode;
  screenShareCodecPriority: AdvancedSettingsManualCodecOrder;
  codecMode: AdvancedSettingsCodecMode;
  codecPriority: AdvancedSettingsManualCodecOrder;
};

/**
 * Resolves which video codecs the screen share publisher should prefer.
 *
 * When the screen share is set to inherit, it mirrors the camera codec configuration; otherwise it
 * uses its own mode (automatic or an explicit manual priority order).
 * @param {ResolveScreenSharePreferredVideoCodecsArgs} args - the camera and screen share codec settings
 * @returns {PublisherProperties['preferredVideoCodecs']} the codecs to pass to the publisher
 */
const resolveScreenSharePreferredVideoCodecs = ({
  screenShareCodecMode,
  screenShareCodecPriority,
  codecMode,
  codecPriority,
}: ResolveScreenSharePreferredVideoCodecsArgs): PublisherProperties['preferredVideoCodecs'] => {
  const inheritsCameraCodecs =
    screenShareCodecMode === ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE.inherit;

  if (inheritsCameraCodecs) {
    return codecMode === ADVANCED_SETTINGS_CODEC_MODE.automatic ? 'automatic' : codecPriority;
  }

  const usesAutomaticCodecs =
    screenShareCodecMode === ADVANCED_SETTINGS_SCREEN_SHARE_CODEC_MODE.automatic;

  if (usesAutomaticCodecs) return 'automatic';

  return screenShareCodecPriority;
};

export default resolveScreenSharePreferredVideoCodecs;
