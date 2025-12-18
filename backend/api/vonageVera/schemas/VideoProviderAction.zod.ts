import z from 'zod';

import { IVideoProvider } from '../types/IVideoProvider';

export type VideoProviderAction = keyof Omit<IVideoProvider, 'generateToken'>;

export const videoProviderActionSchema = z.enum<VideoProviderAction[]>([
  'createSession',
  'startArchive',
  'stopArchive',
  'listArchives',
  'enableCaptions',
  'disableCaptions',
]);
