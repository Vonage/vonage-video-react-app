import { VideoService } from './videoServiceInterface';
import VonageVideoService from './unifiedVideoService';
import OpenTokVideoService from './opentokVideoService';
import loadConfig from '../helpers/config';

const createVideoService = (): VideoService => {
  const config = loadConfig();
  const { provider } = config;

  if (provider === 'vonage') {
    return new VonageVideoService({
      applicationId: config.applicationId,
      privateKey: config.privateKey,
      provider,
    });
  }
  if (provider === 'opentok') {
    return new OpenTokVideoService({
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      provider,
    });
  }
  throw new Error('Unknown video service provider');
};

export default createVideoService;
