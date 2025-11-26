import axios from 'axios';
import { API_URL } from '../utils/constants';

export type SubmissionData = {
  title: string;
  name: string;
  issue: string;
  attachment: string;
};

type ResponseType = {
  message: string;
  ticketUrl: string;
};

/**
 * Posts a request to the server with feedback from the user.
 * @param {SubmissionData} submissionData - The feedback information from the user.
 * @returns {Promise<AxiosResponse<any, any>>} The response from the server.
 */

const reportIssue = async (submissionData: SubmissionData) => {
  return axios.post<{
    feedbackData: ResponseType;
  }>(`${API_URL}/feedback/report`, submissionData);
};

export default reportIssue;
