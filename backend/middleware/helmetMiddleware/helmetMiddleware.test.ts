import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

const helmetHandlerMock = vi.fn();

const helmetMock = vi.fn(() => helmetHandlerMock) as Mock & {
  contentSecurityPolicy: {
    getDefaultDirectives: Mock;
  };
};

helmetMock.contentSecurityPolicy = {
  getDefaultDirectives: vi.fn(() => ({
    'default-src': ["'self'"],
  })),
};

vi.doMock('helmet', () => ({
  default: helmetMock,
}));

describe('helmetMiddleware', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NODE_ENV = 'production';
  });

  it('should call the helmet handler', async () => {
    const { default: helmetMiddleware } = await import('./helmetMiddleware');

    const { req, res, next } = createRequestParameters();

    helmetMiddleware(req, res, next);

    expect(helmetHandlerMock).toHaveBeenCalledWith(req, res, next);
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
    setHeader: vi.fn(),
    removeHeader: vi.fn(),
  } as unknown as Response;

  const next = vi.fn();

  return { req, res, next };
}
