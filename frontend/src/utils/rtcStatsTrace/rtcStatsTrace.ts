import { wrapRTCStatsWithDefaultOptions, type RtcStatsTrace } from '@rtcstats/rtcstats-js';
import env from '../../env';

/**
 * Optional rtcstats-js integration (https://rtcstats.com), off unless `ENABLE_RTCSTATS=true`.
 *
 * When enabled, this wraps the global RTCPeerConnection, getUserMedia, getDisplayMedia and
 * enumerateDevices so every peer connection the Vonage SDK creates is traced. It must run before
 * `@core/interceptors` clones `navigator.mediaDevices`, otherwise the SDK uses an unwrapped copy,
 * which is why the app entry points import this module first.
 *
 * Wrapping stays off by default because the trace buffers events in memory until `connect` is
 * called with the URL the backend returns from `joinSession` (see `RTCSTATS_ENDPOINT` in
 * backend/.env.example).
 */
const rtcStatsTrace: RtcStatsTrace | null = env.ENABLE_RTCSTATS
  ? wrapRTCStatsWithDefaultOptions({
      getStatsInterval: 1000,
      log: console.warn.bind(console),
    })
  : null;

export default rtcStatsTrace;
