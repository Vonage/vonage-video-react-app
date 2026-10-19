import { hasMediaProcessorSupport as hasSdkMediaProcessorSupport } from '@vonage/client-sdk-video';
import { isFirefox, isWebKit } from '@web/platform';

type MediaProcessorType = Parameters<typeof hasSdkMediaProcessorSupport>[0];

/**
 * Wraps the SDK `hasMediaProcessorSupport` to gate background effects and advanced noise suppression.
 * Firefox and Safari report support, but the SDK ML pipeline does not work reliably on them yet,
 * so they are excluded explicitly. Import this helper instead of the SDK export with the same name.
 * TODO(VIDSOL-1291): user-agent based exclusion; drop the browser checks once the SDK fixes FF/Safari support.
 * @param {MediaProcessorType} type - the media type to check ('audio' | 'video' | 'both').
 * @returns {boolean} whether the media processor is supported for the given type.
 */
const hasMediaProcessorSupport = (type: MediaProcessorType): boolean => {
  const isUnsupportedBrowser = isFirefox() || isWebKit();

  if (isUnsupportedBrowser) return false;

  return hasSdkMediaProcessorSupport(type);
};

export default hasMediaProcessorSupport;
