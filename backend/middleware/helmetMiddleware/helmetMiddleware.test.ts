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

  it('does not allow data: in script-src (XSS bypass) while keeping it where the SDK needs it', async () => {
    process.env.NODE_ENV = 'production';

    await import('./helmetMiddleware');

    const config = helmetMock.mock.calls[0][0] as {
      contentSecurityPolicy: { directives: Record<string, string[]> };
    };
    const directives = config.contentSecurityPolicy.directives;

    // data: in script-src allows <script src="data:text/javascript,...">, negating CSP.
    expect(directives['script-src']).not.toContain('data:');
    expect(directives['script-src']).toContain("'self'");
    // The SDK's data: usage is a fallback Worker (worker-src) and inline images (img-src),
    // not scripts — those must keep data:.
    expect(directives['worker-src']).toContain('data:');
    expect(directives['img-src']).toContain('data:');
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
