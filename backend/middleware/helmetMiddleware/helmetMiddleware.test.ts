import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const helmetHandlerMock = jest.fn();

const helmetMock = jest.fn(() => helmetHandlerMock) as jest.Mock & {
  contentSecurityPolicy: {
    getDefaultDirectives: jest.Mock;
  };
};

helmetMock.contentSecurityPolicy = {
  getDefaultDirectives: jest.fn(() => ({
    'default-src': ["'self'"],
  })),
};

jest.unstable_mockModule('helmet', () => ({
  default: helmetMock,
}));

jest.unstable_mockModule('../../helpers/config', () => ({
  default: () => ({
    authEnabled: true,
    oidcEndSessionEndpoint: 'https://idp.example.com/logout',
    oidcPostLogoutRedirectUri: 'https://vera.example.com/',
  }),
}));

describe('helmetMiddleware', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.NODE_ENV = 'production';
  });

  it('should call the helmet handler', async () => {
    const { default: helmetMiddleware } = await import('./helmetMiddleware');

    const { req, res, next } = createRequestParameters();

    helmetMiddleware(req, res, next);

    expect(helmetHandlerMock).toHaveBeenCalledWith(req, res, next);
  });

  it('should allow sign-out form redirects to the provider and the post-logout host', async () => {
    await import('./helmetMiddleware');

    expect(helmetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        contentSecurityPolicy: {
          directives: expect.objectContaining({
            'form-action': ["'self'", 'https://idp.example.com', 'https://vera.example.com'],
          }),
        },
      })
    );
  });

  it('should disable contentSecurityPolicy in development', async () => {
    process.env.NODE_ENV = 'development';

    const { default: helmetMiddleware } = await import('./helmetMiddleware');

    const { req, res, next } = createRequestParameters();

    helmetMiddleware(req, res, next);

    expect(helmetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        contentSecurityPolicy: false,
        hsts: false,
      })
    );

    expect(helmetHandlerMock).toHaveBeenCalledWith(req, res, next);
  });
});

function createRequestParameters() {
  const req = {} as Request;

  const res = {
    setHeader: jest.fn(),
    removeHeader: jest.fn(),
  } as unknown as Response;

  const next = jest.fn();

  return { req, res, next };
}
