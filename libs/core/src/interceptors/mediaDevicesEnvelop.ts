import { interceptObject } from '@common/helpers';

/**
 * Early interceptor for media devices, allows to override after they have been destructured by the Vonage SDK.
 *
 * The proxy replaces `navigator.mediaDevices` so that any code (including the
 * Vonage SDK) that reads methods from it will go through the intercept layer.
 */
const mediaDevicesEnvelop = interceptObject(navigator, 'mediaDevices');

export default mediaDevicesEnvelop;
