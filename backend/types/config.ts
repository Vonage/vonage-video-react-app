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

export type AuthConfig =
  | { authEnabled: false }
  | { authEnabled: true; oidcIssuerUrl: string; oidcClientId: string };

export type Config = (VonageConfig | OpentokConfig) &
  FeedbackConfig &
  AuthConfig & {
    sessionKeySecret: string;
    loggerVerbose: boolean;
  };
