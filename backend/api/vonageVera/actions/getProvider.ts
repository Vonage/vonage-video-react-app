import OpenTokVideoService from '../providers/OpenTokVideoService';
import VonageVideoService from '../providers/VonageVideoService';
import makeBadRequestErrorHandler from '@common/errors/handlers/makeBadRequestErrorHandler';

type VonageVera = import('../VonageVera').default;

function getProvider(this: VonageVera) {
  const { providerConfig } = this;

  if (providerConfig.provider === 'vonage') {
    return new VonageVideoService({
      applicationId: providerConfig.applicationId,
      privateKey: providerConfig.privateKey,
      provider: providerConfig.provider,
    });
  }

  if (providerConfig.provider === 'opentok') {
    return new OpenTokVideoService({
      apiKey: providerConfig.apiKey,
      apiSecret: providerConfig.apiSecret,
      provider: providerConfig.provider,
    });
  }

  throw makeBadRequestErrorHandler('Unsupported provider type')(null);
}

export default getProvider;
