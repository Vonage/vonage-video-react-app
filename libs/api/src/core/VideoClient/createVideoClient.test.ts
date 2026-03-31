import { describe, it, expect } from 'vitest';
import createVideoClient from './createVideoClient';
import VideoClient from './VideoClient';
import type { VideoClientConfig } from '@api-lib/types';

describe('createVideoClient', () => {
  it('should create a VideoClient instance', () => {
    const config: VideoClientConfig = {
      auth: {
        authType: 'apiKey',
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
      },
      videoParams: {},
    };

    const client = createVideoClient(config);

    expect(client).toBeInstanceOf(VideoClient);
  });
});
