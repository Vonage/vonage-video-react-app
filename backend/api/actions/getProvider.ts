import OpenTokVideoService from '../videoService/OpenTokVideoService';
import VonageVideoService from '../videoService/VonageVideoService';

export type VonageVera = import('../VonageVera').default;

function getProvider(this: VonageVera) {
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
}

export default getProvider;
