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
      };
    }),
  };
};
export default mockOpentokConfig;
