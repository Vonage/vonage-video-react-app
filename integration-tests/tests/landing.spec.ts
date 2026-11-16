// eslint-disable-next-line @nx/enforce-module-boundaries
import { testIds as roomNameInputTestIds } from '../../frontend/src/components/RoomNameInput/testIds';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { testIds as newRoomButtonTestIds } from '../../frontend/src/components/NewRoomButton/testIds';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { testIds as joinWaitRoomButtonTestIds } from '../../frontend/src/components/JoinWaitRoomButton/testIds';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { testIds as userNameInputTestIds } from '../../frontend/src/components/WaitingRoom/UserNameInput/testIds';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { testIds as roomJoinContainerTestIds } from '../../frontend/src/components/RoomJoinContainer/testIds';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { testIds as languageSelectorTestIds } from '../../frontend/src/components/LanguageSelector/testIds';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { testIds as wizardDialogTestIds } from '../../frontend/src/components/CreateRoomWizard/components/CreateRoomWizardDialog/testIds';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { testIds as wizardFooterTestIds } from '../../frontend/src/components/CreateRoomWizard/components/CreateRoomWizardFooterActions/testIds';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { testIds as linkCopyTestIds } from '../../frontend/src/components/CreateRoomWizard/components/ShareStep/components/LinkCopyField/testIds';
import { expect } from '@playwright/test';
import { test, baseURL } from '../fixtures/testWithLogging';

test.beforeEach(async ({ page }) => {
  await page.goto(baseURL);
});

test('should navigate to waiting room then publish in room via room name textbox', async ({
  page,
}) => {
  await page.getByTestId(roomNameInputTestIds.input).fill('some-room');

  await page.getByTestId(joinWaitRoomButtonTestIds.button).click();

  await expect(page).toHaveURL(new RegExp(`${baseURL}waiting-room/.+`));

  await page.waitForSelector('.video__element', { state: 'visible' });

  await page.getByTestId(userNameInputTestIds.input).fill('some-user');
  await page.getByTestId(userNameInputTestIds.joinButton).click();

  await expect(page).toHaveURL(new RegExp(`${baseURL}room/.+`));

  await page.waitForSelector('.publisher', { state: 'visible' });
});

test('should create a meeting, copy its link, then join and publish via Create room button', async ({
  page,
  context,
  browserName,
}) => {
  await page.getByTestId(newRoomButtonTestIds.button).click();

  const wizard = page.getByTestId(wizardDialogTestIds.dialog);
  const meetingLink = await wizard.getByTestId(linkCopyTestIds.link).textContent();

  await wizard.getByTestId(linkCopyTestIds.copyButton).click();
  await expect(wizard.getByTestId(linkCopyTestIds.copyButton)).toHaveAccessibleName('Link copied');
  if (browserName === 'chromium') {
    await context.grantPermissions(['clipboard-read']);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(meetingLink);
  }

  await wizard.getByTestId(wizardFooterTestIds.joinButton).click();

  await expect(page).toHaveURL(meetingLink ?? '');

  await page.waitForSelector('.video__element', { state: 'visible' });

  await page.getByTestId(userNameInputTestIds.input).fill('some-user');
  await page.getByTestId(userNameInputTestIds.joinButton).click();

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
  await page.getByTestId(roomNameInputTestIds.input).fill('some-room');

  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(new RegExp(`${baseURL}waiting-room/.+`));
  await page.waitForLoadState('domcontentloaded');

  // This is needed for the DeviceAccessAlert to hide
  await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 });

  const nameInput = page.getByTestId(userNameInputTestIds.input);
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
      languageCode: 'en',
      sectionHeading: 'Start a new video meeting',
      joinHeading: 'Join room',
      roomNameLabel: 'Room ID',
      joinWaitingRoomButton: 'Join waiting room',
      emptyRoomNameErrorText: 'Enter a valid room ID',
    },
    {
      languageCode: 'en-US',
      sectionHeading: 'Start a new video meeting',
      joinHeading: 'Join room',
      roomNameLabel: 'Room ID',
      joinWaitingRoomButton: 'Join waiting room',
      emptyRoomNameErrorText: 'Enter a valid room ID',
    },
    {
      languageCode: 'de',
      sectionHeading: 'Neues Videomeeting starten',
      joinHeading: 'Raum beitreten',
      roomNameLabel: 'Raum-ID',
      joinWaitingRoomButton: 'Warteraum betreten',
      emptyRoomNameErrorText: 'Geben Sie eine gültige Raum-ID',
    },
    {
      languageCode: 'it',
      sectionHeading: 'Inizia una nuova',
      joinHeading: 'Unisciti a una stanza',
      roomNameLabel: 'ID della stanza',
      joinWaitingRoomButton: "Unisciti alla sala d'attesa",
      emptyRoomNameErrorText: 'Inserisci un ID della stanza',
    },
    {
      languageCode: 'es-MX',
      sectionHeading: 'Iniciar una nueva',
      joinHeading: 'Unirse a una sala',
      roomNameLabel: 'ID de sala',
      joinWaitingRoomButton: 'Unirse a la sala de espera',
      emptyRoomNameErrorText: 'Escribe un ID de sala',
    },
  ];

  for (const expectation of localizedLandingExpectations) {
    await page.getByTestId(languageSelectorTestIds.selector).getByRole('combobox').click();
    await page.getByTestId(languageSelectorTestIds.option(expectation.languageCode)).click();

    await expect(page.getByTestId(roomJoinContainerTestIds.createHeading)).toContainText(
      expectation.sectionHeading
    );
    await expect(page.getByTestId(roomJoinContainerTestIds.joinHeading)).toHaveText(
      expectation.joinHeading
    );

    await expect(page.getByTestId(joinWaitRoomButtonTestIds.button)).toHaveAccessibleName(
      expectation.joinWaitingRoomButton
    );
    await page.getByTestId(joinWaitRoomButtonTestIds.button).click();
    await expect(page.getByTestId(roomNameInputTestIds.input)).toHaveAccessibleName(
      expectation.roomNameLabel
    );
    await expect(page.getByTestId(roomNameInputTestIds.error)).toContainText(
      expectation.emptyRoomNameErrorText
    );
  }
});
