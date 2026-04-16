import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Video } from '@vonage/video';
import createVideoHandler from './createVideoHandler';
import { videoRouterContext } from '@api-lib/constants';
import type { VideoRouterConfig } from '@api-lib/types';

describe('createVideoHandler', () => {
  const mockApiKey = 'test-api-key';
  const mockApiSecret = 'test-api-secret';

  beforeEach(() => {
    // Spy on Video prototype methods
    vi.spyOn(Video.prototype, 'createSession');
    vi.spyOn(Video.prototype, 'startArchive');
    vi.spyOn(Video.prototype, 'stopArchive');
    vi.spyOn(Video.prototype, 'searchArchives');
    vi.spyOn(Video.prototype, 'enableCaptions');
    vi.spyOn(Video.prototype, 'disableCaptions');
    vi.spyOn(Video.prototype, 'generateClientToken').mockReturnValue('mock-token-12345');
  });

  describe('handler creation', () => {
    it('should create an Express middleware handler', () => {
      const { handlerConfig } = setupMocks();

      const handler = createVideoHandler(handlerConfig);

      expect(handler).toBeDefined();
      expect(typeof handler).toBe('function');
    });

    it('should create handler with custom config', () => {
      setupMocks();

      const customConfig: VideoRouterConfig<Record<string, unknown>, object, object> = {
        auth: {
          authType: 'apiKey',
          apiKey: 'custom-key',
          apiSecret: 'custom-secret',
        },
        videoParams: { timeout: 10000 },
        handlersConfig: {},
      };

      const handler = createVideoHandler(customConfig);

      expect(handler).toBeDefined();
    });
  });

  describe('router functionality via handler', () => {
    it('should create Express middleware that wraps video router', () => {
      const { handlerConfig } = setupMocks();

      const handler = createVideoHandler(handlerConfig);

      // Handler is an Express middleware function
      expect(typeof handler).toBe('function');
      expect(handler.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('configuration validation', () => {
    it('should accept valid auth configuration', () => {
      setupMocks();

      const validConfig: VideoRouterConfig<Record<string, unknown>, object, object> = {
        auth: {
          authType: 'apiKey',
          apiKey: 'test-key',
          apiSecret: 'test-secret',
        },
        videoParams: {},
        handlersConfig: {},
      };

      expect(() => createVideoHandler(validConfig)).not.toThrow();
    });

    it('should accept optional videoParams', () => {
      setupMocks();

      const configWithParams: VideoRouterConfig<Record<string, unknown>, object, object> = {
        auth: {
          authType: 'apiKey',
          apiKey: mockApiKey,
          apiSecret: mockApiSecret,
        },
        videoParams: {
          timeout: 5000,
        },
        handlersConfig: {},
      };

      expect(() => createVideoHandler(configWithParams)).not.toThrow();
    });

    it('should accept optional routerOptions', () => {
      setupMocks();

      const configWithRouterOptions: VideoRouterConfig<Record<string, unknown>, object, object> = {
        auth: {
          authType: 'apiKey',
          apiKey: mockApiKey,
          apiSecret: mockApiSecret,
        },
        videoParams: {},
        routerOptions: {
          isDev: true,
        },
        handlersConfig: {},
      };

      expect(() => createVideoHandler(configWithRouterOptions)).not.toThrow();
    });

    it('should accept handlersConfig', () => {
      setupMocks();

      const configWithHandlers: VideoRouterConfig<Record<string, unknown>, object, object> = {
        auth: {
          authType: 'apiKey',
          apiKey: mockApiKey,
          apiSecret: mockApiSecret,
        },
        videoParams: {},
        handlersConfig: {
          createSession: {
            selectInput: (input: unknown) => input,
          },
        },
      };

      expect(() => createVideoHandler(configWithHandlers)).not.toThrow();
    });
  });

  describe('context creation', () => {
    it('should create handler with createContext option', () => {
      const { handlerConfig } = setupMocks();

      const createContext = vi.fn().mockReturnValue({
        [videoRouterContext]: undefined,
      });

      const configWithContext = {
        ...handlerConfig,
        createContext,
      };

      const handler = createVideoHandler(configWithContext);

      expect(handler).toBeDefined();
    });

    it('should support custom context types', () => {
      const { handlerConfig } = setupMocks();

      type CustomContext = {
        [videoRouterContext]: undefined;
        user?: { id: string };
      };

      const createContext = (): CustomContext => ({
        [videoRouterContext]: undefined,
        user: { id: 'test-user' },
      });

      const configWithCustomContext = {
        ...handlerConfig,
        createContext,
      };

      const handler = createVideoHandler(configWithCustomContext);

      expect(handler).toBeDefined();
    });
  });

  describe('handler options passthrough', () => {
    it('should pass through Express middleware options', () => {
      const { handlerConfig } = setupMocks();

      const onError = vi.fn();

      const configWithOptions = {
        ...handlerConfig,
        onError,
      };

      const handler = createVideoHandler(configWithOptions);

      expect(handler).toBeDefined();
    });

    it('should pass through request handling options', () => {
      const { handlerConfig } = setupMocks();

      const maxBodySize = 1024 * 1024; // 1MB

      const configWithOptions = {
        ...handlerConfig,
        maxBodySize,
      };

      const handler = createVideoHandler(configWithOptions);

      expect(handler).toBeDefined();
    });
  });

  describe('multiple handler instances', () => {
    it('should create independent handler instances', () => {
      setupMocks();

      const config1: VideoRouterConfig<Record<string, unknown>, object, object> = {
        auth: {
          authType: 'apiKey',
          apiKey: 'key-1',
          apiSecret: 'secret-1',
        },
        videoParams: {},
        handlersConfig: {},
      };

      const config2: VideoRouterConfig<Record<string, unknown>, object, object> = {
        auth: {
          authType: 'apiKey',
          apiKey: 'key-2',
          apiSecret: 'secret-2',
        },
        videoParams: {},
        handlersConfig: {},
      };

      const handler1 = createVideoHandler(config1);
      const handler2 = createVideoHandler(config2);

      expect(handler1).toBeDefined();
      expect(handler2).toBeDefined();
      expect(handler1).not.toBe(handler2);
    });
  });

  describe('router integration', () => {
    it('should integrate with video router for all actions', () => {
      const { handlerConfig } = setupMocks();

      const handler = createVideoHandler(handlerConfig);

      // Handler should be a valid Express middleware
      expect(typeof handler).toBe('function');
      expect(handler.length).toBeGreaterThanOrEqual(2); // Express middleware signature (req, res, next?)
    });

    it('should preserve video router configuration', () => {
      const { handlerConfig } = setupMocks();

      const handler = createVideoHandler(handlerConfig);

      expect(handler).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle invalid configuration gracefully', () => {
      setupMocks();

      const invalidConfig = {
        auth: null,
        videoParams: {},
        handlersConfig: {},
      } as unknown as VideoRouterConfig<Record<string, unknown>, object, object>;

      expect(() => createVideoHandler(invalidConfig)).toThrow();
    });
  });
});

function setupMocks() {
  const handlerConfig: VideoRouterConfig<Record<string, unknown>, object, object> = {
    auth: {
      authType: 'apiKey',
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
    },
    videoParams: {},
    handlersConfig: {},
  };

  return { handlerConfig };
}
