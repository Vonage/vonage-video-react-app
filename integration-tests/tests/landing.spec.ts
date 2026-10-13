import { expect } from '@playwright/test';
import { test, baseURL } from '../fixtures/testWithLogging';

test.beforeEach(async ({ page }) => {
  await page.goto(baseURL);
});

test('should navigate to waiting room then publish in room via room name textbox', async ({
  page,
}) => {
  await page.getByRole('textbox', { name: /Room name/i }).fill('some-room');

  await page.locator('button:text("Join waiting room")').click();

  await expect(page).toHaveURL(new RegExp(`${baseURL}waiting-room/.+`));

  await page.waitForSelector('.video__element', { state: 'visible' });

  await page.waitForTimeout(1000);
  await page.getByLabel('Name').fill('some-user');
  await page.getByRole('button', { name: 'Join meeting' }).click();

  await expect(page).toHaveURL(new RegExp(`${baseURL}room/.+`));

  await page.waitForSelector('.publisher', { state: 'visible' });
});

test('should navigate to waiting room then publish in room via Create room button', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Create a new room' }).click();

  await expect(page).toHaveURL(new RegExp(`${baseURL}waiting-room/.+`));

  await page.waitForSelector('.video__element', { state: 'visible' });

  await page.waitForTimeout(1000);
  await page.getByLabel('Name').fill('some-user');
  await page.getByRole('button', { name: 'Join meeting' }).click();

  await expect(page).toHaveURL(/\/room\/.+/);

  await page.waitForSelector('.publisher', { state: 'visible' });
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
  await page.getByRole('textbox', { name: /Room name/i }).fill('some-room');

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
      joinHeading: 'Join existing meeting',
      roomNameLabel: 'Room name',
      joinWaitingRoomButton: 'Join waiting room',
      emptyRoomNameErrorText: 'Cannot be empty, contain',
    },
    {
      languageOption: 'English (US)',
      sectionHeading: 'Start a new video meeting',
      joinHeading: 'Join existing meeting',
      roomNameLabel: 'Room name',
      joinWaitingRoomButton: 'Join waiting room',
      emptyRoomNameErrorText: 'Cannot be empty, contain',
    },
    {
      languageOption: 'Deutsch',
      sectionHeading: 'Neues Videomeeting starten',
      joinHeading: 'Bestehendem Meeting beitreten',
      roomNameLabel: 'Raumname',
      joinWaitingRoomButton: 'Warteraum betreten',
      emptyRoomNameErrorText: 'Kann nicht leer sein und darf',
    },
    {
      languageOption: 'Italiano',
      sectionHeading: 'Inizia una nuova',
      joinHeading: 'Unisciti a una riunione',
      roomNameLabel: 'Nome della stanza',
      joinWaitingRoomButton: "Unisciti alla sala d'attesa",
      emptyRoomNameErrorText: 'Non può essere vuoto,',
    },
    {
      languageOption: 'Español (México)',
      sectionHeading: 'Iniciar una nueva',
      joinHeading: 'Unirse a una reunión existente',
      roomNameLabel: 'Nombre de sala',
      joinWaitingRoomButton: 'Unirse a la sala de espera',
      emptyRoomNameErrorText: 'No se permite dejar el campo',
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
