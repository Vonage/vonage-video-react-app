import { VideoAction } from '@api-lib/types';
import {
  EnableCaptionsPayloadSchema,
  DisableCaptionsPayloadSchema,
  CreateSessionPayloadSchema,
  DecodeSessionIdPayloadSchema,
  JoinSessionPayloadSchema,
  SearchArchivesPayloadSchema,
  StartArchivePayloadSchema,
  StopArchivePayloadSchema,
  CreateEphemeralTokenPayloadSchema,
} from '../schemas';
import type { ZodType } from 'zod';

const schemasByAction = {
  [VideoAction.createSession]: CreateSessionPayloadSchema.optional(),
  [VideoAction.decodeSessionId]: DecodeSessionIdPayloadSchema,
  [VideoAction.startArchive]: StartArchivePayloadSchema,
  [VideoAction.stopArchive]: StopArchivePayloadSchema,
  [VideoAction.searchArchives]: SearchArchivesPayloadSchema,
  [VideoAction.enableCaptions]: EnableCaptionsPayloadSchema,
  [VideoAction.disableCaptions]: DisableCaptionsPayloadSchema,
  [VideoAction.createEphemeralToken]: CreateEphemeralTokenPayloadSchema,
  [VideoAction.joinSession]: JoinSessionPayloadSchema,
} as const satisfies Record<VideoAction, ZodType>;

export default schemasByAction;
