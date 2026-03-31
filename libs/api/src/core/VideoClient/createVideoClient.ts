import { VideoClientConfig } from '@api-lib/types';
import VideoClient from './VideoClient';

const createVideoClient = (config: VideoClientConfig) => {
  return new VideoClient(config);
};

export default createVideoClient;
