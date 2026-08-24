import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

type IntrospectionResponse = { active: boolean; sub?: string };

const axiosPostMock = jest.fn<() => Promise<{ data: IntrospectionResponse }>>();

jest.unstable_mockModule('axios', () => ({
  default: { post: axiosPostMock },
}));

describe('oktaAuthMiddleware', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.OKTA_AUTH_ENABLED;
    process.env.OKTA_CLIENT_ID = 'test-client-id';
    process.env.OKTA_ISSUER_URL = 'https://example.com';
  });

  it.each([undefined, 'false'])('is a no-op when OKTA_AUTH_ENABLED is %s', async (value) => {
    if (value) process.env.OKTA_AUTH_ENABLED = value;

    const { default: oktaAuthMiddleware } = await import('./oktaAuthMiddleware');
    const { req, res, next } = createRequestParameters();

    await oktaAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it('returns 401 when the token is missing from both the Bearer header and the session', async () => {
    process.env.OKTA_AUTH_ENABLED = 'true';

    const { default: oktaAuthMiddleware } = await import('./oktaAuthMiddleware');
    const { req, res, next } = createRequestParameters();

    await oktaAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(axiosPostMock).not.toHaveBeenCalled();
  });

  it('falls back to the session accessToken when the Bearer header is absent', async () => {
    process.env.OKTA_AUTH_ENABLED = 'true';
    axiosPostMock.mockResolvedValue({ data: { active: true, sub: 'user-2' } });

    const { default: oktaAuthMiddleware } = await import('./oktaAuthMiddleware');
    const { req, res, next } = createRequestParameters({
      session: { accessToken: 'session-token' },
    });

    await oktaAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when introspection reports the token inactive', async () => {
    process.env.OKTA_AUTH_ENABLED = 'true';
    axiosPostMock.mockResolvedValue({ data: { active: false } });

    const { default: oktaAuthMiddleware } = await import('./oktaAuthMiddleware');
    const { req, res, next } = createRequestParameters({
      headers: { authorization: 'Bearer inactive-token' },
    });

    await oktaAuthMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts a lowercase "bearer" scheme, per RFC 7235 case-insensitivity', async () => {
    process.env.OKTA_AUTH_ENABLED = 'true';
    axiosPostMock.mockResolvedValue({ data: { active: true, sub: 'user-3' } });

    const { default: oktaAuthMiddleware } = await import('./oktaAuthMiddleware');
    const { req, res, next } = createRequestParameters({
      headers: { authorization: 'bearer lowercase-token' },
    });

    await oktaAuthMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it.each([{ OKTA_ISSUER_URL: '' }, { OKTA_CLIENT_ID: '' }])(
    'returns 500 when required Okta env vars are missing (%s)',
    async (envOverrides) => {
      process.env.OKTA_AUTH_ENABLED = 'true';
      Object.assign(process.env, envOverrides);

      const { default: oktaAuthMiddleware } = await import('./oktaAuthMiddleware');
      const { req, res, next } = createRequestParameters({
        headers: { authorization: 'Bearer some-token' },
      });

      await oktaAuthMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(next).not.toHaveBeenCalled();
      expect(axiosPostMock).not.toHaveBeenCalled();
    }
  );

  it('returns 401 when the introspection call itself fails', async () => {
    process.env.OKTA_AUTH_ENABLED = 'true';
    axiosPostMock.mockRejectedValue(new Error('network error'));

    const { default: oktaAuthMiddleware } = await import('./oktaAuthMiddleware');
    const { req, res, next } = createRequestParameters({
      headers: { authorization: 'Bearer some-token' },
    });

    await oktaAuthMiddleware(req, res, next);

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
