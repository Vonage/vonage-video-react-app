import { expect } from '@playwright/test';
import { test } from '../fixtures/testWithLogging';
import { APP_URL } from './constants';
import requestAccessToken from './helpers/requestAccessToken';

const PROTECTED_API_URL = `${APP_URL}/session/e2e-auth-api-room`;

test('an API request without credentials gets a 401, not a redirect', async ({ request }) => {
  const res = await request.get(PROTECTED_API_URL, {
    headers: { Accept: 'application/json' },
    maxRedirects: 0,
  });

  expect(res.status()).toEqual(401);
});

test('a Bearer token from the provider is accepted without setting cookies (mobile path)', async ({
  request,
}) => {
  const accessToken = await requestAccessToken(request);

  const res = await request.get(PROTECTED_API_URL, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
  });

  expect(res.status()).toEqual(200);
  expect(res.headers()['set-cookie']).toBeUndefined();
});

test('an invalid Bearer token gets a 401', async ({ request }) => {
  const res = await request.get(PROTECTED_API_URL, {
    headers: { Accept: 'application/json', Authorization: 'Bearer not-a-real-token' },
  });

  expect(res.status()).toEqual(401);
});
