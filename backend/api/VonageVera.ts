import type { IVideoProvider, ProviderType } from './types';
import getProvider from './actions/getProvider';
import getHandler from './actions/getHandler';

class VonageVera {
  public providerType: ProviderType;

  public videoProvider: IVideoProvider;

  constructor(args: { provider: ProviderType }) {
    this.providerType = args.provider;
    this.videoProvider = this.getProvider();
  }

  protected getProvider = getProvider;

  public getHandler = getHandler;
}

export default VonageVera;
