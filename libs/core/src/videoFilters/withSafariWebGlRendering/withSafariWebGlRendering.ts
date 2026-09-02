import type { VideoFilter } from '@vonage/client-sdk-video';
import { isWebKit } from '@web/platform';

type VideoFilterRenderingOptions = {
  renderingOptions?: {
    type: 'WEBGL' | 'CANVAS';
  };
};

export type VideoFilterWithRendering = VideoFilter & VideoFilterRenderingOptions;

/**
 * Forces the media processor onto its WebGL backend for background replacement on Safari.
 *
 * The SDK selects a rendering backend per filter type and defaults to CANVAS.
 * `BackgroundBlurConfig` overrides that to WEBGL when the browser is Safari, but
 * `BackgroundReplacementConfig` does not, so replacement composites frames on a 2D canvas
 * and Safari terminates the WebContent process after 90-180 seconds at 720p: the page goes
 * blank and the camera permission prompt returns.
 *
 * The SDK merges caller options over its own defaults, so passing the backend through the
 * filter reaches the same configuration the missing override would have set.
 * @param {VideoFilter | undefined} videoFilter - the filter about to be handed to the SDK
 * @returns {VideoFilterWithRendering | undefined} the filter, with the backend pinned where needed
 */
const withSafariWebGlRendering = (
  videoFilter: VideoFilter | undefined
): VideoFilterWithRendering | undefined => {
  if (!videoFilter) return videoFilter;
  if (videoFilter.type !== 'backgroundReplacement') return videoFilter;
  if (!isWebKit()) return videoFilter;

  return { ...videoFilter, renderingOptions: { type: 'WEBGL' } };
};

export default withSafariWebGlRendering;
