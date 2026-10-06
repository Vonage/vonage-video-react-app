import { expect } from '@playwright/test';
import { test } from '../fixtures/testWithLogging';
import {
  ACCESS_TOKEN_LIFETIME_SECONDS,
  APP_URL,
  ID_TOKEN_COOKIE_NAME,
  REFRESH_WINDOW_SECONDS,
  SESSION_COOKIE_NAME,
  TRANSACTION_COOKIE_NAME,
} from './constants';
import readCookie from './helpers/readCookie';

const PROTECTED_API_URL = `${APP_URL}/session/e2e-auth-session-room`;

test('session cookies are HttpOnly, SameSite=Lax and the transaction cookie is gone', async ({
  page,
  context,
}) => {
  await page.goto(`${APP_URL}/`);

  const sessionCookie = await readCookie({ context, name: SESSION_COOKIE_NAME });
  const idTokenCookie = await readCookie({ context, name: ID_TOKEN_COOKIE_NAME });
  const transactionCookie = await readCookie({ context, name: TRANSACTION_COOKIE_NAME });

  expect(sessionCookie).toMatchObject({ httpOnly: true, sameSite: 'Lax', path: '/' });
  expect(idTokenCookie).toMatchObject({ httpOnly: true, sameSite: 'Lax', path: '/auth/signout' });
  expect(transactionCookie).toBeUndefined();
});

test('the session is refreshed ahead of access token expiry', async ({ page, context }) => {
  await page.goto(`${APP_URL}/`);
  const initialSessionCookie = await readCookie({ context, name: SESSION_COOKIE_NAME });

  const secondsUntilRefreshWindow = ACCESS_TOKEN_LIFETIME_SECONDS - REFRESH_WINDOW_SECONDS;
  await page.waitForTimeout((secondsUntilRefreshWindow + 2) * 1000);

  const res = await context.request.get(PROTECTED_API_URL, {
    headers: { Accept: 'application/json' },
  });

  const refreshedSessionCookie = await readCookie({ context, name: SESSION_COOKIE_NAME });

  expect(res.status()).toEqual(200);
  expect(refreshedSessionCookie?.value).toBeDefined();
  expect(refreshedSessionCookie?.value).not.toEqual(initialSessionCookie?.value);
});

test('a tampered session cookie sends the user through sign-in without showing the error page', async ({
  page,
  context,
}) => {
  await page.goto(`${APP_URL}/`);
  const sessionCookie = await readCookie({ context, name: SESSION_COOKIE_NAME });
  const tamperedValue = `${sessionCookie?.value}tampered`;

  await context.addCookies([{ ...sessionCookie, value: tamperedValue }]);

  const signInRequest = page.waitForRequest((request) =>
    request.url().startsWith(`${APP_URL}/auth/signin`)
  );
  await page.getByRole('button', { name: 'Create a new room' }).click();
  await signInRequest;

  await expect(page).toHaveURL(`${APP_URL}/`);
  await expect(page.getByTestId('error-page')).toHaveCount(0);

  const renewedSessionCookie = await readCookie({ context, name: SESSION_COOKIE_NAME });
  expect(renewedSessionCookie?.value).toBeDefined();
  expect(renewedSessionCookie?.value).not.toEqual(tamperedValue);
});
