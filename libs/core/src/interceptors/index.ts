/**
 * The patch should be applied before importing any file,
 * Fixes compatibility issues of web-rtc-adapter browsers/environments.
 */
import './webrtc-adapter.patch';
import './patch-sdk-console-log';

export { default as xmlHttpRequestEnvelop } from './xmlHttpRequestEnvelop';
export { default as mediaDevicesEnvelop } from './mediaDevicesEnvelop';
