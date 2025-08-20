/* eslint-disable no-underscore-dangle */
import { Auth } from '@vonage/auth';
import {
  LayoutType,
  MediaMode,
  Resolution,
  SingleArchiveResponse,
  Video,
  EnableCaptionResponse,
  CaptionOptions,
} from '@vonage/video';
import { VideoService } from './videoServiceInterface';
import { VonageConfig } from '../types/config';
import { TokenRole } from '../types/tokenRoles';

class VonageVideoService implements VideoService {
  private readonly credentials: Auth;
  private readonly vonageVideo: Video;

  constructor(private readonly config: VonageConfig) {
    this.config = config;
    this.credentials = new Auth({
      applicationId: this.config.applicationId,
      privateKey: this.config.privateKey,
    });
    this.vonageVideo = new Video(this.credentials);
  }

  private static getTokenRole(tokenRole: TokenRole): string {
    switch (tokenRole) {
      case 'admin':
        return 'moderator';
      case 'participant':
        return 'publisher';
      case 'viewer':
        return 'subscriber';
      default:
        return 'publisher';
    }
  }

  async createSession(): Promise<string> {
    const { sessionId } = await this.vonageVideo.createSession({ mediaMode: MediaMode.ROUTED });
    return sessionId;
  }

  async listArchives(sessionId: string): Promise<SingleArchiveResponse[]> {
    const archives = await this.vonageVideo.searchArchives({ sessionId });
    return archives.items;
  }

  generateToken(sessionId: string, tokenRole: TokenRole): { token: string; apiKey: string } {
    const token = this.vonageVideo.generateClientToken(sessionId, {
      role: VonageVideoService.getTokenRole(tokenRole),
    });
    return { token, apiKey: this.config.applicationId };
  }

  async startArchive(
    roomName: string,
    sessionId: string,
    tokenRole: string
  ): Promise<SingleArchiveResponse> {
    if (tokenRole === 'admin') {
      return this.vonageVideo.startArchive(sessionId, {
        name: roomName,
        resolution: Resolution.FHD_LANDSCAPE,
        layout: {
          // In multiparty archives, we use the 'bestFit' layout to scale based on the number of streams. For screen-sharing archives,
          // we select 'horizontalPresentation' so the screenshare stream is displayed prominently along with other streams.
          // See: https://developer.vonage.com/en/video/guides/archive-broadcast-layout#layout-types-for-screen-sharing
          type: LayoutType.BEST_FIT,
          screenshareType: 'horizontalPresentation',
        },
      });
    }
    throw new Error('Only admins can start an archive');
  }

  async stopArchive(archiveId: string, tokenRole: string): Promise<string> {
    if (tokenRole === 'admin') {
      await this.vonageVideo.stopArchive(archiveId);
      return 'Archive stopped successfully';
    }
    throw new Error('Only admins can stop an archive');
  }

  async enableCaptions(sessionId: string, tokenRole: TokenRole): Promise<EnableCaptionResponse> {
    if (tokenRole === 'admin') {
      const requestToken = this.generateToken(sessionId, tokenRole);
      const { token } = requestToken;

      try {
        const captionOptions: CaptionOptions = {
          // The full list of supported languages can be found here: https://developer.vonage.com/en/video/guides/live-caption#supported-languages
          languageCode: 'en-US',
          // The maximum duration of the captions in seconds. The default is 14,400 seconds (4 hours).
          maxDuration: 1800,
          // Enabling partial captions allows for more frequent updates to the captions.
          // This is useful for real-time applications where the captions need to be updated frequently.
          // However, it may also increase the number of inaccuracies in the captions.
          partialCaptions: 'true',
        };
        const captionsId = await this.vonageVideo.enableCaptions(sessionId, token, captionOptions);
        return captionsId;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to enable captions: ${errorMessage}`);
      }
    }

    throw new Error('Only admins can start captions');
  }

  async disableCaptions(captionsId: string, tokenRole: TokenRole): Promise<string> {
    if (tokenRole === 'admin') {
      try {
        await this.vonageVideo.disableCaptions(captionsId);
        return 'Captions stopped successfully';
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to disable captions: ${errorMessage}`);
      }
    }
    throw new Error('Only admins can stop captions');
  }
}

export default VonageVideoService;
