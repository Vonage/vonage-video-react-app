import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

type IntrospectionResponse = { active: boolean; sub?: string; client_id?: string };

const axiosPostMock = jest.fn<() => Promise<{ data: IntrospectionResponse }>>();

const CONFIGURED_CLIENT_ID = 'test-client-id';

jest.unstable_mockModule('axios', () => ({
  default: { post: axiosPostMock },
}));

describe('tokenAuthMiddleware', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.AUTH_ENABLED;
    process.env.OIDC_CLIENT_ID = CONFIGURED_CLIENT_ID;
    process.env.OIDC_ISSUER_URL = 'https://example.com';
  });

  it.each([undefined, 'false'])('is a no-op when AUTH_ENABLED is %s', async (value) => {
    if (value) process.env.AUTH_ENABLED = value;

    const { default: tokenAuthMiddleware } = await import('./tokenAuthMiddleware');
    const { req, res, next } = createRequestParameters();

    await tokenAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it('returns 401 when the token is missing from both the Bearer header and the session', async () => {
    process.env.AUTH_ENABLED = 'true';

    const { default: tokenAuthMiddleware } = await import('./tokenAuthMiddleware');
    const { req, res, next } = createRequestParameters();

    await tokenAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it('falls back to the session accessToken when the Bearer header is absent', async () => {
    process.env.AUTH_ENABLED = 'true';
    axiosPostMock.mockResolvedValue({
      data: { active: true, sub: 'user-2', client_id: CONFIGURED_CLIENT_ID },
    });

    const { default: tokenAuthMiddleware } = await import('./tokenAuthMiddleware');
    const { req, res, next } = createRequestParameters({
      session: { accessToken: 'session-token' },
    });

    await tokenAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when introspection reports the token inactive', async () => {
    process.env.AUTH_ENABLED = 'true';
    axiosPostMock.mockResolvedValue({ data: { active: false } });

    const { default: tokenAuthMiddleware } = await import('./tokenAuthMiddleware');
    const { req, res, next } = createRequestParameters({
      headers: { authorization: 'Bearer inactive-token' },
    });

    await tokenAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when the token was issued to a different client id', async () => {
    process.env.AUTH_ENABLED = 'true';
    axiosPostMock.mockResolvedValue({
      data: { active: true, sub: 'user-4', client_id: 'some-other-app-client-id' },
    });

    const { default: tokenAuthMiddleware } = await import('./tokenAuthMiddleware');
    const { req, res, next } = createRequestParameters({
      headers: { authorization: 'Bearer token-for-a-different-app' },
    });

    await tokenAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts a lowercase "bearer" scheme, per RFC 7235 case-insensitivity', async () => {
    process.env.AUTH_ENABLED = 'true';
    axiosPostMock.mockResolvedValue({
      data: { active: true, sub: 'user-3', client_id: CONFIGURED_CLIENT_ID },
    });

    const { default: tokenAuthMiddleware } = await import('./tokenAuthMiddleware');
    const { req, res, next } = createRequestParameters({
      headers: { authorization: 'bearer lowercase-token' },
    });

    await tokenAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it.each([{ OIDC_ISSUER_URL: '' }, { OIDC_CLIENT_ID: '' }])(
    'returns 500 when required OIDC env vars are missing (%s)',
    async (envOverrides) => {
      process.env.AUTH_ENABLED = 'true';
      Object.assign(process.env, envOverrides);

      const { default: tokenAuthMiddleware } = await import('./tokenAuthMiddleware');
      const { req, res, next } = createRequestParameters({
        headers: { authorization: 'Bearer some-token' },
      });

      await tokenAuthMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(next).not.toHaveBeenCalled();
      expect(axiosPostMock).not.toHaveBeenCalled();
    }
  );

  it('returns 401 when the introspection call itself fails', async () => {
    process.env.AUTH_ENABLED = 'true';
    axiosPostMock.mockRejectedValue(new Error('network error'));

    const { default: tokenAuthMiddleware } = await import('./tokenAuthMiddleware');
    const { req, res, next } = createRequestParameters({
      headers: { authorization: 'Bearer some-token' },
    });

    await tokenAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

function createRequestParameters(
  overrides: {
    headers?: Record<string, string>;
    session?: { accessToken?: string };
  } = {}
) {
  const req = {
    headers: overrides.headers ?? {},
    session: overrides.session,
  } as unknown as Request;

  const json = jest.fn();
  const res = {
    status: jest.fn().mockReturnValue({ json }),
  } as unknown as Response;

  const next = jest.fn() as unknown as NextFunction;

  return { req, res, next };
}
