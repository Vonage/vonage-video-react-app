export type FeedbackConfig = {
  url?: string;
  apiUrl?: string;
  token?: string;
  key?: string;
  componentId?: string;
  iOScomponentId?: string;
  androidComponentId?: string;
  epicLink?: string;
  epicUrl?: string;
};

export type VonageConfig = {
  provider: 'vonage';
  applicationId: string;
  privateKey: string;
};
export type OpentokConfig = {
  provider: 'opentok';
  apiKey: string;
  apiSecret: string;
};

export type Config = (VonageConfig | OpentokConfig) & FeedbackConfig;
