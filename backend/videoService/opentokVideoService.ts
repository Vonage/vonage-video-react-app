import OpenTok, { Archive, Role } from 'opentok';
import { VideoService } from './videoServiceInterface';
import { OpentokConfig } from '../types/config';

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
}

export default OpenTokVideoService;
