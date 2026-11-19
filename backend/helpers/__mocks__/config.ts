import { vi } from 'vitest';

const mockOpentokConfig = () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
        applicationId: 'test-application-id',
        privateKey: 'test-private-key',
        provider: 'opentok',
        gollumUrl: 'https://example.com',
        loggerVerbose: false,
        authEnabled: false,
      };
    }),
  };
};
export default mockOpentokConfig;
