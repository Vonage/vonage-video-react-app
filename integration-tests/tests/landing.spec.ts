import { expect } from '@playwright/test';
import { test, baseURL } from '../fixtures/testWithLogging';

test.beforeEach(async ({ page }) => {
  await page.goto(baseURL);
});

test('should navigate to waiting room then publish in room via room name textbox', async ({
  page,
}) => {
  await page.getByRole('textbox', { name: /Room ID/i }).fill('some-room');

  await page.locator('button:text("Join waiting room")').click();

  await expect(page).toHaveURL(new RegExp(`${baseURL}waiting-room/.+`));

  await page.waitForSelector('.video__element', { state: 'visible' });

  await page.waitForTimeout(1000);
  await page.getByLabel('Name').fill('some-user');
  await page.getByRole('button', { name: 'Join meeting' }).click();

  await expect(page).toHaveURL(new RegExp(`${baseURL}room/.+`));

  await page.waitForSelector('.publisher', { state: 'visible' });
});

test('should create a meeting, copy its link, then join and publish via Create room button', async ({
  page,
  context,
  browserName,
}) => {
  await page.getByRole('button', { name: 'Create a new room' }).click();

  const wizard = page.getByRole('dialog', { name: 'Create a meeting' });
  await expect(wizard.getByText('the link never expires')).toBeVisible();
  await wizard.getByRole('button', { name: 'Create meeting' }).click();
  const meetingLink = await wizard.getByText(new RegExp(`${baseURL}waiting-room/.+`)).textContent();

  await wizard.getByRole('button', { name: 'Copy link' }).click();
  await expect(wizard.getByRole('button', { name: 'Link copied' })).toBeVisible();
  if (browserName === 'chromium') {
    await context.grantPermissions(['clipboard-read']);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(meetingLink);
  }

  await wizard.getByRole('button', { name: 'Join now' }).click();

  await expect(page).toHaveURL(meetingLink ?? '');

  await page.waitForSelector('.video__element', { state: 'visible' });

  await page.waitForTimeout(1000);
  await page.getByLabel('Name').fill('some-user');
  await page.getByRole('button', { name: 'Join meeting' }).click();

  await expect(page).toHaveURL(/\/room\/.+/);

  await page.waitForSelector('.publisher', { state: 'visible' });
});

test('should create a named meeting scheduled for two hours and open its waiting room', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Create a new room' }).click();

  const wizard = page.getByRole('dialog', { name: 'Create a meeting' });
  await wizard.getByLabel('Meeting name (optional)').fill('weekly-sync');
  await wizard.getByRole('checkbox', { name: 'Set a date and time' }).check();
  await expect(wizard.getByRole('button', { name: '1 hour' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await wizard.getByRole('button', { name: '2 hours' }).click();
  await wizard.getByRole('button', { name: 'Create meeting' }).click();

  await expect(wizard.getByText('weekly-sync')).toBeVisible();
  await expect(wizard.getByText(/ · 2 hours$/)).toBeVisible();
  const meetingLink = await wizard.getByText(new RegExp(`${baseURL}waiting-room/.+`)).textContent();

  await wizard.getByRole('button', { name: 'Join now' }).click();

  await expect(page).toHaveURL(meetingLink ?? '');
});

test('GitHub Logo Redirect to Vonage GitHub URL in New Tab', async ({ page, context }) => {
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: 'Visit our GitHub Repo' }).click(), // Opens a new tab
  ]);
  await newPage.waitForLoadState();
  await expect(newPage).toHaveURL('https://github.com/Vonage/vonage-video-react-app/');
});

test('User should be able to navigate to the next page using enter key', async ({ page }) => {
  await page.getByRole('textbox', { name: /Room ID/i }).fill('some-room');

  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(new RegExp(`${baseURL}waiting-room/.+`));
  await page.waitForLoadState('domcontentloaded');

  // This is needed for the DeviceAccessAlert to hide
  await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 });
  await page.waitForTimeout(500);

  const nameInput = page.getByLabel('Name');
  await nameInput.waitFor({ state: 'visible' });
  await nameInput.fill('some-user');

  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(new RegExp(`${baseURL}room/.+`));
  await page.waitForLoadState('networkidle');

  await page.waitForSelector('.publisher', { state: 'visible', timeout: 10000 });
});

test('should keep landing content equivalent across languages', async ({ page }) => {
  const localizedLandingExpectations = [
    {
      languageOption: 'English',
      sectionHeading: 'Start a new video meeting',
      joinHeading: 'Join room',
      roomNameLabel: 'Room ID',
      joinWaitingRoomButton: 'Join waiting room',
      emptyRoomNameErrorText: 'Enter a valid room ID',
    },
    {
      languageOption: 'English (US)',
      sectionHeading: 'Start a new video meeting',
      joinHeading: 'Join room',
      roomNameLabel: 'Room ID',
      joinWaitingRoomButton: 'Join waiting room',
      emptyRoomNameErrorText: 'Enter a valid room ID',
    },
    {
      languageOption: 'Deutsch',
      sectionHeading: 'Neues Videomeeting starten',
      joinHeading: 'Raum beitreten',
      roomNameLabel: 'Raum-ID',
      joinWaitingRoomButton: 'Warteraum betreten',
      emptyRoomNameErrorText: 'Geben Sie eine gültige Raum-ID',
    },
    {
      languageOption: 'Italiano',
      sectionHeading: 'Inizia una nuova',
      joinHeading: 'Unisciti a una stanza',
      roomNameLabel: 'ID della stanza',
      joinWaitingRoomButton: "Unisciti alla sala d'attesa",
      emptyRoomNameErrorText: 'Inserisci un ID della stanza',
    },
    {
      languageOption: 'Español (México)',
      sectionHeading: 'Iniciar una nueva',
      joinHeading: 'Unirse a una sala',
      roomNameLabel: 'ID de sala',
      joinWaitingRoomButton: 'Unirse a la sala de espera',
      emptyRoomNameErrorText: 'Escribe un ID de sala',
    },
  ];

  for (const expectation of localizedLandingExpectations) {
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: expectation.languageOption, exact: true }).click();

    await expect(page.getByRole('heading', { name: expectation.sectionHeading })).toBeVisible();
    await expect(page.getByRole('heading', { name: expectation.joinHeading })).toBeVisible();

    await page.getByRole('button', { name: expectation.joinWaitingRoomButton }).click();
    await expect(page.getByLabel(expectation.roomNameLabel)).toBeVisible();
    await expect(page.getByText(expectation.emptyRoomNameErrorText)).toBeVisible();
  }
});
