import OpenTok, { Archive, Role } from 'opentok';
import axios from 'axios';
import { projectToken } from 'opentok-jwt';
import { VideoService } from './videoServiceInterface';
import { OpentokConfig } from '../types/config';

export type EnableCaptionResponse = {
  captionsId: string;
};

class OpenTokVideoService implements VideoService {
  private readonly opentok: OpenTok;

  constructor(private readonly config: OpentokConfig) {
    const { apiKey, apiSecret } = config;
    this.opentok = new OpenTok(apiKey, apiSecret);
  }

  private static getTokenRole(): Role {
    // We set token role to Moderator in order to allow force muting of another participant
    // In a real world application you may use roles based on the user type in your application
    // See documentation for more information: https://tokbox.com/developer/guides/create-token/
    return 'moderator';
  }

  createSession(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.opentok.createSession({ mediaMode: 'routed' }, (error, session) => {
        if (error || !session) {
          reject(error ?? new Error('Unknown error occurred, no session created.'));
        } else {
          const { sessionId } = session;
          resolve(sessionId);
        }
      });
    });
  }

  generateToken(sessionId: string): { token: string; apiKey: string } {
    const token = this.opentok.generateToken(sessionId, {
      role: OpenTokVideoService.getTokenRole(),
    });
    return { token, apiKey: this.config.apiKey };
  }

  startArchive(roomName: string, sessionId: string): Promise<Archive> {
    return new Promise((resolve, reject) => {
      this.opentok.startArchive(
        sessionId,
        {
          name: roomName,
          resolution: '1920x1080',
          layout: {
            // In multiparty archives, we use the 'bestFit' layout to scale based on the number of streams. For screen-sharing archives,
            // we select 'horizontalPresentation' so the screenshare stream is displayed prominently along with other streams.
            // See: https://developer.vonage.com/en/video/guides/archive-broadcast-layout#layout-types-for-screen-sharing
            type: 'bestFit',
            screenshareType: 'horizontalPresentation',
          },
        },
        (error, archive) => {
          if (archive) {
            resolve(archive);
          } else {
            reject(error ?? new Error('Unknown error occurred when starting archive.'));
          }
        }
      );
    });
  }

  stopArchive(archiveId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.opentok.stopArchive(archiveId, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(archiveId);
        }
      });
    });
  }

  listArchives(sessionId: string): Promise<OpenTok.Archive[] | undefined> {
    return new Promise((resolve, reject) => {
      const options = { sessionId };
      this.opentok.listArchives(options, (error, archives) => {
        if (error) {
          reject(error);
        } else {
          resolve(archives);
        }
      });
    });
  }

  // The OpenTok API does not support enabling captions directly through the OpenTok SDK.
  // Instead, we need to make a direct HTTP request to the OpenTok API endpoint to enable captions.
  // This is not the case for Vonage Video Node SDK, which has a built-in method for enabling captions.
  readonly API_URL = 'https://api.opentok.com/v2/project';

  async enableCaptions(sessionId: string): Promise<EnableCaptionResponse> {
    const expires = Math.floor(new Date().getTime() / 1000) + 24 * 60 * 60;
    // Note that the project token is different from the session token.
    // The project token is used to authenticate the request to the OpenTok API.
    const projectJWT = projectToken(this.config.apiKey, this.config.apiSecret, expires);
    const captionURL = `${this.API_URL}/${this.config.apiKey}/captions`;

    const requestToken = this.generateToken(sessionId);
    const { token } = requestToken;
    const captionAxiosPostBody = {
      sessionId,
      token,
      languageCode: 'en-US',
      maxDuration: 1800,
      partialCaptions: true,
    };

    const response = await axios.post(captionURL, captionAxiosPostBody, {
      headers: {
        'X-OPENTOK-AUTH': projectJWT,
        'Content-Type': 'application/json',
      },
    });

    const responseData: EnableCaptionResponse = {
      captionsId: response.data.captionsId,
    };
    return responseData;
  }

  async disableCaptions(captionId: string): Promise<string> {
    const expires = Math.floor(new Date().getTime() / 1000) + 24 * 60 * 60;
    // Note that the project token is different from the session token.
    // The project token is used to authenticate the request to the OpenTok API.
    const projectJWT = projectToken(this.config.apiKey, this.config.apiSecret, expires);
    const captionURL = `${this.API_URL}/${this.config.apiKey}/captions/${captionId}/stop`;
    await axios.post(
      captionURL,
      {},
      {
        headers: {
          'X-OPENTOK-AUTH': projectJWT,
          'Content-Type': 'application/json',
        },
      }
    );
    return 'Captions stopped successfully';
  }
}

export default OpenTokVideoService;
