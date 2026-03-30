import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../../utils/constants';

/**
 * Send a request to start archiving.
 * See https://developer.vonage.com/en/use-cases/multiparty-with-archiving-with-vonage-video-api#handling-archives
 * @param {string} roomName - The name of the meeting room
 * @returns {Promise<AxiosResponse<any, any>>} The response from the archiving session.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const startArchiving = async (roomName: string): Promise<AxiosResponse<any, any>> => {
  return axios.post(`${API_URL}/session/${roomName}/startArchive`);
};

/**
 * Send a request to stop archiving.
 * See https://developer.vonage.com/en/use-cases/multiparty-with-archiving-with-vonage-video-api#handling-archives
 * @param {string} roomName - The name of the meeting room
 * @param {string} archiveId - The ID for the currently recording archive.
 * @returns {Promise<AxiosResponse<any, any>>} The response from the archiving session.
 */
export const stopArchiving = async (
  roomName: string,
  archiveId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<AxiosResponse<any, any>> => {
  return axios.post(`${API_URL}/session/${roomName}/${archiveId}/stopArchive`);
};

/**
 * Get list of all of the archives from the meeting room.
 * See https://developer.vonage.com/en/use-cases/multiparty-with-archiving-with-vonage-video-api#handling-archives
 * @param {string} roomName - The name of the meeting room
 * @returns {Promise<AxiosResponse<any, any>>} The response from the archiving session.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const searchArchives = (roomName: string): Promise<AxiosResponse<any, any>> =>
  axios.get(`${API_URL}/session/${roomName}/archives`);
