import { VideoAction } from '@api-lib/types';
import {
  EnableCaptionsPayloadSchema,
  DisableCaptionsPayloadSchema,
  CreateSessionPayloadSchema,
  JoinSessionPayloadSchema,
  SearchArchivesPayloadSchema,
  StartArchivePayloadSchema,
  StopArchivePayloadSchema,
  CreateEphemeralTokenPayloadSchema,
  CreateSessionAndJoinPayloadSchema,
  GetServerSettingsPayloadSchema,
  ExtendSessionPayloadSchema,
  RenewSessionKeyPayloadSchema,
} from '../schemas';
import type { ZodType } from 'zod';

const schemasByAction = {
  [VideoAction.createSession]: CreateSessionPayloadSchema.optional(),
  [VideoAction.createSessionAndJoin]: CreateSessionAndJoinPayloadSchema.optional(),
  [VideoAction.startArchive]: StartArchivePayloadSchema,
  [VideoAction.stopArchive]: StopArchivePayloadSchema,
  [VideoAction.searchArchives]: SearchArchivesPayloadSchema,
  [VideoAction.enableCaptions]: EnableCaptionsPayloadSchema,
  [VideoAction.ensureCaptionsEnabled]: EnableCaptionsPayloadSchema,
  [VideoAction.disableCaptions]: DisableCaptionsPayloadSchema,
  [VideoAction.createEphemeralToken]: CreateEphemeralTokenPayloadSchema,
  [VideoAction.joinSession]: JoinSessionPayloadSchema,
  [VideoAction.getServerSettings]: GetServerSettingsPayloadSchema.optional(),
  [VideoAction.extendSession]: ExtendSessionPayloadSchema,
  [VideoAction.renewSessionKey]: RenewSessionKeyPayloadSchema,
} as const satisfies Record<VideoAction, ZodType>;

export default schemasByAction;
