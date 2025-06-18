import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../utils/constants';

export type EnableCaptionsType = {
  captionsId: string;
};

export type DisableCaptionsType = {
  response: string;
};

/**
 * Send a request to start captions.
 * More about enabling captions can be found here: https://developer.vonage.com/en/video/guides/live-caption#steps-to-enable-live-captions
 * @param {string} roomName - The name of the meeting room
 * @returns {Promise<AxiosResponse<EnableCaptionsType>>} The response from the captions session.
 */
export const enableCaptions = async (
  roomName: string
): Promise<AxiosResponse<EnableCaptionsType>> => {
  return axios.post(`${API_URL}/session/${roomName}/enableCaptions`);
};

/**
 * Send a request to stop captions.
 * @param {string} roomName - The name of the meeting room
 * @param {string} captionsId - The ID for the currently-enabled captions.
 * @returns {Promise<AxiosResponse<DisableCaptionsType>>} The response from the captions session.
 */
export const disableCaptions = async (
  roomName: string,
  captionsId: string
): Promise<AxiosResponse<DisableCaptionsType>> => {
  return await axios.post(`${API_URL}/session/${roomName}/${captionsId}/disableCaptions`);
};
