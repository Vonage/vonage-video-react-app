import type { VideoClient } from '@core/services';

type ServerSettings = Awaited<ReturnType<VideoClient['getServerSettings']>>;

export type ServerSettingsResult = ServerSettings & {
  /**
   * Milliseconds to add to `Date.now()` to get the server time.
   */
  clockOffset: number;
};
