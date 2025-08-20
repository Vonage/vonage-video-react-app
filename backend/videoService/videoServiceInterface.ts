import { SingleArchiveResponse, EnableCaptionResponse } from '@vonage/video';
import { Archive } from 'opentok';
import { TokenRole } from '../types/tokenRoles';

export interface VideoService {
  createSession(): Promise<string>;
  generateToken(
    sessionId: string,
    tokenRole: TokenRole
  ): { token: string; applicationId?: string; apiKey?: string };
  startArchive(
    roomName: string,
    sessionId: string,
    tokenRole: TokenRole
  ): Promise<Archive | SingleArchiveResponse>;
  stopArchive(archiveId: string, tokenRole: TokenRole): Promise<string>;
  listArchives(
    sessionId: string,
    tokenRole: TokenRole
  ): Promise<Archive[] | SingleArchiveResponse[] | undefined>;
  enableCaptions(sessionId: string, tokenRole: TokenRole): Promise<EnableCaptionResponse>;
  disableCaptions(captionsId: string, tokenRole: TokenRole): Promise<string>;
}
