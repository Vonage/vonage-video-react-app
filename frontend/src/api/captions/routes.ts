import axios, { AxiosResponse } from 'axios';
import { API_URL } from '../../utils/constants';

export type EnableCaptionsType = {
  captions: {
    captionsId: string;
  };
};

/**
 * Send a request to start captions.
 * UPDATE THE LINK TO THE CAPTIONS API
 * @param {string} roomName - The name of the meeting room
 * change the return type to the correct one
 * @returns {Promise<AxiosResponse<EnableCaptionsType>>} The response from the archiving session.
 */
export const enableCaptions = async (
  roomName: string
): Promise<
  AxiosResponse<{
    captions: {
      captionsId: string;
    };
  }>
> => {
  return axios.post(`${API_URL}/session/${roomName}/enableCaptions`);
};

export type DisableCaptionsType = {
  status: number;
};

/**
 * Send a request to stop captions.
 * UPDATE THE LINK TO THE CAPTIONS API
 * @param {string} roomName - The name of the meeting room
 * @param {string} captionId - The ID for the currently-enabled captions.
 *  change the return type to the correct one
 * @returns {Promise<AxiosResponse<DisableCaptionsType>>} The response from the captions session.
 */
export const disableCaptions = async (
  roomName: string,
  captionId: string
): Promise<
  AxiosResponse<{
    status: number;
  }>
> => {
  return await axios.post(`${API_URL}/session/${roomName}/${captionId}/disableCaptions`);
};
