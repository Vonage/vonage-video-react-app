import type { IVideoProvider } from './types';
import getProvider from './actions/getProvider';
import getHandler from './actions/getHandler';
import { assertProviderConfig, ProviderConfig } from './schemas/ProviderConfig.zod';

class VonageVera {
  public videoProvider: IVideoProvider;

  public providerConfig: ProviderConfig;

  constructor(args: ProviderConfig) {
    assertProviderConfig(args);

    this.providerConfig = args;
    this.videoProvider = this.getProvider();
  }

  protected getProvider = getProvider;

  public getHandler = getHandler;
}

export default VonageVera;
