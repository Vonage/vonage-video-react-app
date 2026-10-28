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
};

export type LoggerConfig = {
  gollumUrl?: string;
  loggerVerbose: boolean;
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
import type { CorsConfig } from '../middleware/corsMiddleware/schemas/CorsConfig.schema';
import type { RoomAccessConfig } from '../routes/video/schemas/RoomAccessConfig.schema';

export type Config = (VonageConfig | OpentokConfig) &
  FeedbackConfig &
  LoggerConfig &
  AuthConfig &
  CorsConfig &
  RoomAccessConfig & {
    sessionKeySecret: string;
  };
