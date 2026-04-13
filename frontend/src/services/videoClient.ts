import { createVideoClient } from '@core/services';
import { env } from '../env';

const videoClient = createVideoClient({
  url: `${env.API_URL}/v2`,
});

export default videoClient;
