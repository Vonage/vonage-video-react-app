import { jwtDecode } from 'jwt-decode';
import { getStorageItem } from '../utils/storage';

/**
 * @typedef CredentialsType
 * @property {string} sessionId - the ID of the session (i.e., video call) to join
 * @property {string} token - authenticates the user to the session (only users with valid tokens may join a session)
 * @property {string} apiKey - your API key
 */

/**
 * Returns the credentials needed to enter video call
 * See https://developer.vonage.com/en/video/guides/video-api-basics-overview#basic-vonage-video-api-functionality
 * @param {string} _roomName - the name of the meeting room
 * @returns {CredentialsType} the credentials needed to enter the meeting room
 */

export default async (_roomName?: string) => {
  const token = getStorageItem('token');
  if (!token) {
    throw new Error('Rofim token is missing from localStorage');
  }
  const rofimSession = jwtDecode<{ apiKey: string; sessionId: string; token: string }>(token);

  return {
    data: {
      apiKey: rofimSession.apiKey,
      sessionId: rofimSession.sessionId,
      token: rofimSession.token,
    },
  };
};
