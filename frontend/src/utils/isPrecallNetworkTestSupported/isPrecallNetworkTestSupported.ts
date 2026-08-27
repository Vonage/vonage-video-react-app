import isFirefox from '@web/platform/isFirefox';

/**
 * Whether the waiting-room pre-call test can run.
 * `@vonage/video-client-network-test` dropped Firefox from `testQuality()` in 2.6.0
 * (missing WebRTC stats). Chrome, Safari, Edge, and Opera remain supported.
 */
const isPrecallNetworkTestSupported = (): boolean => !isFirefox();

export default isPrecallNetworkTestSupported;
