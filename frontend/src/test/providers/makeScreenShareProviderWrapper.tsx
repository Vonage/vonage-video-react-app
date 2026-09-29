import screenShare$ from '@Context/screenShare/screenShare$';

export type ScreenShareProviderWrapperOptions = Parameters<
  typeof screenShare$.Provider.makeProviderWrapper
>[0];

function makeScreenShareProviderWrapper(options: ScreenShareProviderWrapperOptions = {}) {
  return screenShare$.Provider.makeProviderWrapper(options);
}

export default makeScreenShareProviderWrapper;
