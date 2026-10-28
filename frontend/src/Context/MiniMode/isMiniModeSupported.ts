import { isDocumentPictureInPictureSupported } from '@web/documentPictureInPicture';
import { env } from '../../env';

/**
 * Whether Mini Mode is enabled by configuration and available in this browser.
 * @returns {boolean} true when ALLOW_MINI_MODE is set and Document Picture-in-Picture is supported
 */
const isMiniModeSupported = (): boolean =>
  env.ALLOW_MINI_MODE && isDocumentPictureInPictureSupported();

export default isMiniModeSupported;
