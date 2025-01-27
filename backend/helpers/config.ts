import dotenv from 'dotenv';
import path from 'path';
import { Config, FeedbackConfig } from '../types/config';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const loadConfig = (): Config => {
  const provider = process.env.VIDEO_SERVICE_PROVIDER ?? 'vonage';

  const feedbackConfig: FeedbackConfig = {
    url: process.env.JIRA_URL,
    apiUrl: process.env.JIRA_API_URL,
    token: process.env.JIRA_TOKEN,
    key: process.env.JIRA_PROJECT_KEY,
    componentId: process.env.JIRA_COMPONENT_ID,
    epicLink: process.env.JIRA_EPIC_LINK,
    epicUrl: process.env.JIRA_EPIC_URL,
  };
  if (provider === 'vonage') {
    const applicationId = process.env.VONAGE_APP_ID ?? '';
    const privateKey = process.env.VONAGE_PRIVATE_KEY ?? '';

    if (!applicationId || !privateKey) {
      throw new Error('Missing config values for Vonage');
    }

    return {
      ...feedbackConfig,
      applicationId,
      privateKey,
      provider: 'vonage',
    };
  }
  if (provider === 'opentok') {
    const apiKey = process.env.OT_API_KEY ?? '';
    const apiSecret = process.env.OT_API_SECRET ?? '';

    if (!apiKey || !apiSecret) {
      throw new Error('Missing config values for OpenTok');
    }

    return {
      ...feedbackConfig,
      apiKey,
      apiSecret,
      provider: 'opentok',
    };
  }
  throw new Error('Unknown video service provider');
};

export default loadConfig;
