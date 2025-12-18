import { IVideoProvider } from './IVideoProvider';

export type VideoProviderAction = keyof Omit<IVideoProvider, 'generateToken'>;
