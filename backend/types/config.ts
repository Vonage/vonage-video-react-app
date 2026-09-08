export type FeedbackConfig = {
  url?: string;
  apiUrl?: string;
  token?: string;
  key?: string;
  componentId?: string;
  iOSComponentId?: string;
  androidComponentId?: string;
  epicLink?: string;
  epicUrl?: string;
  severityId?: string;
  gollumUrl?: string;
};

export type VonageConfig = {
  provider: 'vonage';
  applicationId: string;
  privateKey: string;
  videoHost?: string;
};

export type OpentokConfig = {
  provider: 'opentok';
  apiKey: string;
  apiSecret: string;
};

export type { AuthConfig } from '../middleware/authMiddleware/schemas/AuthConfig.schema';

import type { AuthConfig } from '../middleware/authMiddleware/schemas/AuthConfig.schema';

export type Config = (VonageConfig | OpentokConfig) &
  FeedbackConfig &
  AuthConfig & {
    sessionKeySecret: string;
    loggerVerbose: boolean;
  };
