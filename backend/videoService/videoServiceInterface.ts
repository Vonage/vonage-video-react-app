import { SingleArchiveResponse, EnableCaptionResponse } from '@vonage/video';
import { Archive } from 'opentok';

export interface VideoService {
  createSession(): Promise<string>;
  generateToken(
    sessionId: string,
    tokenRole: string
  ): { token: string; applicationId?: string; apiKey?: string };
  startArchive(
    roomName: string,
    sessionId: string,
    tokenRole: string
  ): Promise<Archive | SingleArchiveResponse>;
  stopArchive(archiveId: string, tokenRole: string): Promise<string>;
  listArchives(
    sessionId: string,
    tokenRole: string
  ): Promise<Archive[] | SingleArchiveResponse[] | undefined>;
  enableCaptions(sessionId: string, tokenRole: string): Promise<EnableCaptionResponse>;
  disableCaptions(captionsId: string, tokenRole?: string): Promise<string>;
}
