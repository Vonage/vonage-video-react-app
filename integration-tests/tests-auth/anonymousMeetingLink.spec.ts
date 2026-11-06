import { expect } from '@playwright/test';
import { test } from '../fixtures/testWithLogging';
import { APP_URL } from './constants';
import requestAccessToken from './helpers/requestAccessToken';

test('an anonymous caller with a meeting link runs the network test and joins without signing in', async ({
  page,
  request,
}) => {
  const accessToken = await requestAccessToken(request);
  const createSessionResponse = await request.post(`${APP_URL}/v2/createSession`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
    data: { roomName: 'e2e-auth-anonymous-link-room' },
  });
  const {
    result: {
      data: { sessionKey },
    },
  } = (await createSessionResponse.json()) as { result: { data: { sessionKey: string } } };
  const navigatedUrls: string[] = [];
  page.on('request', (request) => {
    if (request.isNavigationRequest()) navigatedUrls.push(request.url());
  });

  await page.goto(`${APP_URL}/waiting-room/${sessionKey}`);
  await page.waitForSelector('.video__element', { state: 'visible' });

  expect(navigatedUrls).not.toContainEqual(expect.stringContaining(`${APP_URL}/auth/signin`));
  const networkTestResponse = page.waitForResponse((response) =>
    response.url().includes('/v2/createSessionAndJoin')
  );
  await page
    .locator('button')
    .filter({ has: page.getByTestId('vivid-icon-more-vertical-solid') })
    .click();
  await page.getByTestId('menu-more-options').getByText('Pre-call network test').click();
  expect((await networkTestResponse).status()).toEqual(200);
  await page.getByRole('dialog').getByRole('button', { name: 'Close' }).first().click();
  await page.getByLabel('Name').fill('e2e-auth-anonymous');
  await page.getByRole('button', { name: 'Join meeting' }).click();
  await expect(page.locator('.publisher')).toBeVisible();
});

test('a signed-out visitor opening the landing page or a room-name link is sent to sign in', async ({
  request,
}) => {
  const pageRequestOptions = { headers: { Accept: 'text/html' }, maxRedirects: 0 };

  const landingResponse = await request.get(`${APP_URL}/`, pageRequestOptions);
  const roomNameResponse = await request.get(
    `${APP_URL}/waiting-room/e2e-auth-guessed-room`,
    pageRequestOptions
  );

  expect(landingResponse.headers().location).toMatch(/^\/auth\/signin\?returnTo=/);
  expect(roomNameResponse.headers().location).toMatch(/^\/auth\/signin\?returnTo=/);
});
