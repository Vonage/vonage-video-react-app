export type * from '@node/types';

export type * from './IVideoClient';

// Schema types
export type {
  VideoClientConfig,
  CreateSessionPayload,
  CreateSessionAndJoinPayload,
  DecodeSessionIdPayload,
  CreateEphemeralTokenPayload,
  StartArchivePayload,
  StopArchivePayload,
  SearchArchivesPayload,
  EnableCaptionsPayload,
  JoinSessionPayload,
  SessionOptions,
  VideoPayload,
  VideoRouterConfig,
  SessionSigning,
} from '../schemas';

export type * from './IVideoRouter';

export * from './TokenRole';
export * from './VideoAction';
export type * from './HandlerConfig';
export type * from './HandlersConfig';
export type * from './HandlersDefaults';
