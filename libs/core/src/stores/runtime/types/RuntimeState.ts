import type { QueryClient } from '@tanstack/react-query';
import type { VideoClient } from '@core/services';

export type RuntimeState = {
  videoClient: VideoClient;
  language: string;
  queryClient: QueryClient;
};

export default RuntimeState;
