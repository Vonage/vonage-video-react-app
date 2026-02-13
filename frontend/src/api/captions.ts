import axios from 'axios';
import { API_URL } from '../utils/constants';

/**
 * Type definitions for enabling captions.
 * @typedef {object} EnableCaptionsType
 * @property {string} message (optional) - An error message.
 */
export type EnableCaptionsType = {
  message?: string;
};

/**
 * Send a request to start captions.
 * More about enabling captions can be found here: https://developer.vonage.com/en/video/guides/live-caption#steps-to-enable-live-captions
 * @param {string} roomName - The name of the meeting room
 * @returns {Promise<AxiosResponse<EnableCaptionsType>>} The response from starting the captions request.
 */
export const enableCaptions = async (roomName: string) => {
  return await axios.post<EnableCaptionsType>(`${API_URL}/session/${roomName}/enableCaptions`);
};
