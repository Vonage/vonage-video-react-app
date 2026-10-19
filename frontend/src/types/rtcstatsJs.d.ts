/**
 * Minimal type declarations for `@rtcstats/rtcstats-js`, which ships no types.
 * Only the surface used by `utils/rtcStatsTrace` is declared.
 */
declare module '@rtcstats/rtcstats-js' {
  export type RtcStatsTrace = {
    (method: string, peerConnection: RTCPeerConnection | null, data: unknown): void;
    connect: (webSocketUrl: string) => void;
    close: () => void;
  };

  export type RtcStatsConfig = {
    getStatsInterval?: number;
    countReloads?: boolean;
    log?: (...args: unknown[]) => void;
  };

  export function wrapRTCStatsWithDefaultOptions(
    config?: RtcStatsConfig,
    target?: typeof globalThis
  ): RtcStatsTrace;
}
