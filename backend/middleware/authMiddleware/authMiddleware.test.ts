import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { StatusCode } from 'status-code-enum';

type IntrospectionResponse = { active: boolean; sub?: string; client_id?: string };

const axiosPostMock = jest.fn<() => Promise<{ data: IntrospectionResponse }>>();

const CONFIGURED_CLIENT_ID = 'test-client-id';

jest.unstable_mockModule('axios', () => ({
  default: { post: axiosPostMock },
}));

const { default: authMiddleware } = await import('./authMiddleware');

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VIDEO_SERVICE_PROVIDER = 'opentok';
    process.env.AUTH_ENABLED = 'true';
    process.env.OIDC_CLIENT_ID = CONFIGURED_CLIENT_ID;
    process.env.OIDC_ISSUER_URL = 'https://example.com';
  });

  it('calls next() with a valid Bearer header', async () => {
    axiosPostMock.mockResolvedValue({
      data: { active: true, sub: 'user-1', client_id: CONFIGURED_CLIENT_ID },
    });

    const { req, res, next } = createRequestParameters({
      headers: { authorization: 'Bearer valid-token' },
    });

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('calls next() with a valid session accessToken when the Bearer header is absent', async () => {
    axiosPostMock.mockResolvedValue({
      data: { active: true, sub: 'user-2', client_id: CONFIGURED_CLIENT_ID },
    });

    const { req, res, next } = createRequestParameters({
      session: { accessToken: 'session-token' },
    });

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('calls next() with a 401 error when the token is missing from both the Bearer header and the session', async () => {
    const { req, res, next } = createRequestParameters();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: StatusCode.ClientErrorUnauthorized })
    );
    expect(axiosPostMock).not.toHaveBeenCalled();
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

  const res = {} as unknown as Response;

  const next = jest.fn() as unknown as NextFunction;

  return { req, res, next };
}
