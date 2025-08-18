import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../utils/constants';

/**
 * Type definitions for enabling captions.
 * @typedef {object} EnableCaptionsType
 * @property {string} captionsId - The ID for the currently-enabled captions.
 * @property {string} message (optional) - An error message.
 */
export type EnableCaptionsType = {
  captionsId: string;
  message?: string;
};

/**
 * Type definitions for disabling captions.
 * @typedef {object} DisableCaptionsType
 * @property {string} disableResponse - The response message from disabling captions request.
 * @property {string} errorMessage (optional) - An error message.
 */
export type DisableCaptionsType = {
  messageResponse: string;
  message?: string;
};

/**
 * Send a request to start captions.
 * More about enabling captions can be found here: https://developer.vonage.com/en/video/guides/live-caption#steps-to-enable-live-captions
 * @param {string} roomName - The name of the meeting room
 * @param {string} tokenRole - The user role (e.g., 'admin', 'participant').
 * @returns {Promise<AxiosResponse<EnableCaptionsType>>} The response from starting the captions request.
 */
export const enableCaptions = async (
  roomName: string,
  tokenRole: string
): Promise<AxiosResponse<EnableCaptionsType>> => {
  return await axios.post(`${API_URL}/session/${roomName}/enableCaptions`, { tokenRole });
};

/**
 * Send a request to stop captions.
 * @param {string} roomName - The name of the meeting room
 * @param {string} captionsId - The ID for the currently-enabled captions.
 * @param {string} tokenRole  - The user role (e.g., 'admin', 'participant').
 * @returns {Promise<AxiosResponse<DisableCaptionsType>>} The response message from disabling captions request.
 */
export const disableCaptions = async (
  roomName: string,
  captionsId: string,
  tokenRole: string
): Promise<AxiosResponse<DisableCaptionsType>> => {
  return await axios.post(`${API_URL}/session/${roomName}/${captionsId}/disableCaptions`, {
    tokenRole,
  });
};
