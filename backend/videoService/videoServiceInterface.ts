import type { SingleArchiveResponse, EnableCaptionResponse } from '@vonage/video';
import type { CaptionOptions } from '@vonage/video';
import { Archive } from 'opentok';

export interface VideoService {
  createSession(): Promise<string>;
  generateToken(sessionId: string): {
    token: string;
    applicationId?: string;
    apiKey?: string;
  };
  startArchive(roomName: string, sessionId: string): Promise<Archive | SingleArchiveResponse>;
  stopArchive(archiveId: string): Promise<string>;
  searchArchives(sessionId: string): Promise<Archive[] | SingleArchiveResponse[] | undefined>;
  enableCaptions(
    sessionId: string,
    captionOptions?: CaptionOptions
  ): Promise<EnableCaptionResponse>;
  disableCaptions(captionsId: string): Promise<string>;
}
