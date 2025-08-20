import axios from 'axios';
import { API_URL } from '../utils/constants';
import { TokenRole } from '../types/tokenRoles';
/**
 * @typedef CredentialsType
 * @property {string} sessionId - the ID of the session (i.e., video call) to join
 * @property {string} token - authenticates the user to the session (only users with valid tokens may join a session)
 * @property {string} apiKey - your API key
 */

/**
 * Returns the credentials needed to enter video call
 * See https://developer.vonage.com/en/video/guides/video-api-basics-overview#basic-vonage-video-api-functionality
 * @param {string} roomName - the name of the meeting room
 * @param {TokenRole} tokenRole - the role of the user in the meeting room (e.g., moderator, participant)
 * @returns {CredentialsType} the credentials needed to enter the meeting room
 */

export default async (roomName: string, tokenRole: TokenRole) => {
  return axios.post(`${API_URL}/session/${roomName}`, { tokenRole });
};
