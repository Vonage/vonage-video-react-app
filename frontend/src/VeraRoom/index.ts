// wraps RTCPeerConnection/getUserMedia for rtcstats when ENABLE_RTCSTATS is on. Must run before the
// interceptors clone navigator.mediaDevices and before the vonage sdk creates any peer connections
import '../utils/rtcStatsTrace';

// runs interceptors before vonage sdk initialize resources (XHR, navigator.mediaDevices clones, etc)
import '@core/interceptors';

import '../i18n';
import './VeraRoomElement';

export { createVideoClient } from '@core/services';
export type { VideoClient } from '@core/services';
