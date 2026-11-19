import { expect } from '@playwright/test';
import { test as setup } from '../fixtures/testWithLogging';
import { APP_URL } from './constants';

setup('the app under test has auth enabled', async ({ request }) => {
  const res = await request.get(`${APP_URL}/`, {
    headers: { Accept: 'text/html' },
    maxRedirects: 0,
  });

  // A backend/.env loads with precedence over the test env (backend/helpers/config.ts) and can
  // silently turn auth off or point it elsewhere.
  expect(res.status(), 'GET / must redirect to sign-in; check backend/.env').toEqual(302);
  expect(res.headers().location).toMatch(/^\/auth\/signin\?returnTo=/);
});
