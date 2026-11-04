import { isDocumentPictureInPictureSupported } from '@web/documentPictureInPicture';
import { isMobile } from '@web/platform';
import { env } from '../../env';

/**
 * Whether Mini Mode is enabled by configuration and available on this desktop browser.
 * @returns {boolean} true when ALLOW_MINI_MODE is set, the device is not mobile, and Document Picture-in-Picture is supported
 */
const isMiniModeSupported = (): boolean =>
  env.ALLOW_MINI_MODE && !isMobile() && isDocumentPictureInPictureSupported();

export default isMiniModeSupported;
