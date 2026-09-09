import { jest } from '@jest/globals';

const mockOpentokConfig = () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
        applicationId: 'test-application-id',
        privateKey: 'test-private-key',
        provider: 'opentok',
        gollumUrl: 'https://example.com',
        attachmentMaxBase64Length: 2_000_000,
        sessionKeySecret: 'test-session-key-secret-for-jwt-signing',
        loggerVerbose: false,
      };
    }),
  };
};
export default mockOpentokConfig;
