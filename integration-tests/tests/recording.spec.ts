import { expect, type BrowserContext, type Page, type Route } from '@playwright/test';
import { randomBytes } from 'crypto';
import { test, baseURL } from '../fixtures/testWithLogging';
import { openMeetingRoomWithSettings } from './utils';

const ARCHIVE_PROCESSING_TIMEOUT_MS = 3 * 60 * 1000;
const SEARCH_ARCHIVES_URL = /\/v2\/searchArchives/;
const MOCK_ARCHIVE_ID = 'mock-archive-id';

test.describe('Recording Feature', () => {
  test('should start and stop recording and verify the download link', async ({
    page: pageOne,
    browserName,
    isMobile,
  }) => {
    const roomName = randomBytes(5).toString('hex');

    // locators
    const root = pageOne.locator('#root');
    const publisher = pageOne.locator('.publisher');
    const moreVertIcon = pageOne.getByTestId('MoreVertIcon');
    const archivingButton = pageOne.getByTestId('archiving-button');
    const confirmButton = pageOne.getByTestId('popup-dialog-primary-button');
    const meetingRoom = pageOne.getByTestId('meetingRoom');
    const checkedIcon = pageOne.locator(
      '[data-testid="smallViewportHeader"] [data-testid="recordingIndicator"]'
    );
    const endCallButton = pageOne.getByTestId('CallEndIcon');
    const recordingItem = pageOne.getByTestId('archive-list-item-title-0');
    const downloadIcon = pageOne.getByTestId('archive-download-button');
    const archiveEmptyList = pageOne.getByTestId('archive-list-empty');
    const sessionConnectingSpinner = pageOne.getByTestId('progress-spinner');

    await test.step('Open meeting room', async () => {
      await openMeetingRoomWithSettings({
        page: pageOne,
        username: 'User One',
        roomName,
        audioOff: true,
        browserName,
      });
    });

    await test.step('Wait for publisher to be ready', async () => {
      // Give some time to opentok to settle, in the future we'll remove this wait.
      await pageOne.waitForTimeout(2000);
      // Required for Firefox to ensure publisher is initialized
      await root.click();

      await expect(publisher).toBeVisible();
      // The archiving button silently ignores start requests until the session is connected
      await expect(sessionConnectingSpinner).toHaveCount(0, { timeout: 20_000 });
    });

    if (isMobile) {
      await test.step('Open toolbar in small viewport', async () => {
        await expect(moreVertIcon).toBeVisible();
        await moreVertIcon.click();
        await pageOne.mouse.move(0, 0); // Moves cursor to top-left corner to hide tooltip
      });
    }

    await test.step('Start archiving/recording', async () => {
      // Click archiving button
      await expect(archivingButton).toBeVisible();
      await archivingButton.click();

      // Confirm start recording in dialog
      await expect(confirmButton).toBeVisible();
      await confirmButton.click();
    });

    if (isMobile) {
      await test.step('Close toolbar in small viewport', async () => {
        await expect(checkedIcon).toBeVisible();
        await expect(moreVertIcon).toBeVisible();
        await moreVertIcon.click();
        await pageOne.mouse.move(0, 0);
      });
    }

    await test.step('Wait during recording', async () => {
      // Wait for the recording to actually start (accounts for RECORDING_START_DELAY + API latency)
      await expect(meetingRoom).toHaveClass(/\brecording\b/, { timeout: 10_000 });

      // If the archiving is less than 1 second the endpoint will not respond with the archive
      await pageOne.waitForTimeout(1000);
    });

    await test.step('Stop recording', async () => {
      await expect(archivingButton).toBeVisible();
      await archivingButton.click();

      await expect(confirmButton).toBeVisible();
      await confirmButton.click();

      // Expect recording indicator to disappear
      await expect(meetingRoom).not.toHaveClass(/\brecording\b/);
    });

    await test.step('End call', async () => {
      await expect(endCallButton).toBeVisible();
      await endCallButton.click();
    });

    await test.step('Wait for archive to be available', async () => {
      await expect(archiveEmptyList).not.toBeAttached();

      // Wait for the archive to be processed
      await expect(recordingItem).not.toHaveClass(/\bpending\b/, {
        timeout: 60 * 1000 * 3, // Wait up to 3 minutes for processing the archive
      });

      // Open the processed recording item to view its details and actions
      await recordingItem.click();
    });

    await test.step('Verify download link is present', async () => {
      await expect(downloadIcon).toBeVisible();

      const href = await downloadIcon.evaluate((el) => {
        const anchor = el.closest('a');
        return anchor ? anchor.href : null;
      });

      expect(href).toBeTruthy();
    });
  });
});

test.describe('Recording with multiple participants', () => {
  test('should show the recording state to the other participant and offer the download to both after leaving', async ({
    page: pageOne,
    context,
    browserName,
  }) => {
    test.setTimeout(ARCHIVE_PROCESSING_TIMEOUT_MS + 120_000);

    const { pageTwo } = await openMeetingWithTwoParticipants({ pageOne, context, browserName });

    await test.step('User One starts recording', async () => {
      await toggleRecording(pageOne);
      await expectRecordingState({ page: pageOne, isRecording: true });
    });

    await test.step('User Two consents and sees the recording indicator', async () => {
      await acceptRecordingConsent(pageTwo);
      await expectRecordingState({ page: pageTwo, isRecording: true });
    });

    await test.step('User One stops recording', async () => {
      await pageOne.waitForTimeout(1000);
      await toggleRecording(pageOne);
      await expectRecordingState({ page: pageOne, isRecording: false });
      await expectRecordingState({ page: pageTwo, isRecording: false });
    });

    await test.step('Both users leave and can download the recording', async () => {
      await Promise.all([leaveMeeting(pageOne), leaveMeeting(pageTwo)]);
      await Promise.all([expectDownloadableArchive(pageOne), expectDownloadableArchive(pageTwo)]);
    });
  });

  test('should let the second participant stop a recording started by the first', async ({
    page: pageOne,
    context,
    browserName,
  }) => {
    test.setTimeout(ARCHIVE_PROCESSING_TIMEOUT_MS + 120_000);

    const { pageTwo } = await openMeetingWithTwoParticipants({ pageOne, context, browserName });

    await test.step('User One starts recording', async () => {
      await toggleRecording(pageOne);
      await expectRecordingState({ page: pageOne, isRecording: true });
      await acceptRecordingConsent(pageTwo);
      await expectRecordingState({ page: pageTwo, isRecording: true });
    });

    await test.step('User Two stops recording', async () => {
      await pageTwo.waitForTimeout(1000);
      await toggleRecording(pageTwo);
      await expectRecordingState({ page: pageTwo, isRecording: false });
      await expectRecordingState({ page: pageOne, isRecording: false });
    });

    await test.step('Both users leave and can download the recording', async () => {
      await Promise.all([leaveMeeting(pageOne), leaveMeeting(pageTwo)]);
      await Promise.all([expectDownloadableArchive(pageOne), expectDownloadableArchive(pageTwo)]);
    });
  });
});

test.describe('Archive list states', () => {
  test('should show the empty state when the meeting had no recording', async ({
    page,
    browserName,
  }) => {
    await openMeetingRoomWithSettings({
      page,
      username: 'User One',
      roomName: randomBytes(5).toString('hex'),
      browserName,
    });
    await expect(page.locator('.publisher')).toBeVisible();

    await leaveMeeting(page);

    await expect(page.getByTestId('archive-list-empty')).toBeVisible();
    await expect(page.getByTestId('archive-list-empty')).toHaveText(
      'This session has no content to download'
    );
    await expect(page.locator('[data-testid^="archive-list-item-"]')).toHaveCount(0);
  });

  test('should show the error state when searching archives fails', async ({ page }) => {
    let searchArchivesCallCount = 0;
    await page.route(SEARCH_ARCHIVES_URL, async (route) => {
      searchArchivesCallCount++;
      await fulfillSearchArchivesError(route);
    });

    await page.goto(`${baseURL}goodbye/${randomBytes(5).toString('hex')}`);

    await expect(page.getByTestId('archive-list-error')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('archive-list-error')).toHaveText(
      'There was an error loading content for this meeting'
    );
    await expect(page.getByTestId('archive-list-empty')).toHaveCount(0);
    expect(searchArchivesCallCount).toBeGreaterThan(0);
  });

  test('should show a loading spinner while the archive is processing and then the download', async ({
    page,
  }) => {
    let isArchiveReady = false;
    await page.route(SEARCH_ARCHIVES_URL, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await fulfillSearchArchives({
        route,
        archive: isArchiveReady
          ? { status: 'available', url: 'https://example.com/recording.mp4' }
          : { status: 'started', url: null },
      });
    });

    await page.goto(`${baseURL}goodbye/${randomBytes(5).toString('hex')}`);

    const archiveItem = page.getByTestId(`archive-list-item-${MOCK_ARCHIVE_ID}`);
    await expect(archiveItem.getByTestId('archive-loading-spinner')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId('archive-list-item-title-0')).toHaveText(
      'Your recording is being prepared'
    );
    await expect(page.getByTestId('archive-download-button')).toHaveCount(0);

    isArchiveReady = true;

    await expect(archiveItem.getByTestId('archive-download-button')).toBeVisible({
      timeout: 15_000,
    });
    await expect(archiveItem.getByTestId('archive-loading-spinner')).toHaveCount(0);
    await expect(page.getByTestId('archive-list-item-title-0')).toHaveText('Recording 1');
    await expect(archiveItem.locator('a')).toHaveAttribute(
      'href',
      'https://example.com/recording.mp4'
    );
  });
});

async function openMeetingWithTwoParticipants({
  pageOne,
  context,
  browserName,
}: {
  pageOne: Page;
  context: BrowserContext;
  browserName: string;
}): Promise<{ pageTwo: Page }> {
  const roomName = randomBytes(5).toString('hex');

  await openMeetingRoomWithSettings({
    page: pageOne,
    username: 'User One',
    roomName,
    audioOff: true,
    browserName,
  });
  await expect(pageOne.locator('.publisher')).toBeVisible();

  const pageTwo = await context.newPage();
  await openMeetingRoomWithSettings({
    page: pageTwo,
    username: 'User Two',
    roomName,
    audioOff: true,
    browserName,
  });
  await expect(pageTwo.locator('.publisher')).toBeVisible();

  await expect(pageOne.locator('.subscriber').getByText('User Two')).toBeVisible({
    timeout: 20_000,
  });
  await expect(pageTwo.locator('.subscriber').getByText('User One')).toBeVisible({
    timeout: 20_000,
  });

  return { pageTwo };
}

async function toggleRecording(page: Page): Promise<void> {
  const visibleArchivingButton = page.locator('[data-testid="archiving-button"]:visible');

  const isButtonInToolbar = (await visibleArchivingButton.count()) > 0;
  if (!isButtonInToolbar) {
    await page.getByTestId('hidden-toolbar-items').click();
    await page.mouse.move(0, 0);
  }

  await visibleArchivingButton.first().click();

  const confirmButton = page.getByTestId('popup-dialog-primary-button');
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();
}

async function acceptRecordingConsent(page: Page): Promise<void> {
  const consentButton = page.getByRole('button', { name: 'I consent' });
  await expect(consentButton).toBeVisible({ timeout: 15_000 });
  await consentButton.click();
  await expect(consentButton).toBeHidden();
}

async function expectRecordingState({
  page,
  isRecording,
}: {
  page: Page;
  isRecording: boolean;
}): Promise<void> {
  const meetingRoom = page.getByTestId('meetingRoom');
  const visibleRecordingIndicator = page.locator('[data-testid="recordingIndicator"]:visible');

  if (isRecording) {
    await expect(meetingRoom).toHaveClass(/\brecording\b/, { timeout: 15_000 });
    await expect(visibleRecordingIndicator.first()).toBeVisible();
    return;
  }

  await expect(meetingRoom).not.toHaveClass(/\brecording\b/, { timeout: 15_000 });
  await expect(visibleRecordingIndicator).toHaveCount(0);
}

async function leaveMeeting(page: Page): Promise<void> {
  const exitButton = page.getByTestId('CallEndIcon');
  await expect(exitButton).toBeEnabled();
  await exitButton.click();
  await expect(page).toHaveURL(/goodbye/);
}

async function expectDownloadableArchive(page: Page): Promise<void> {
  const archiveTitle = page.getByTestId('archive-list-item-title-0');
  await expect(archiveTitle).toBeVisible({ timeout: 30_000 });
  await expect(archiveTitle).not.toHaveClass(/\bpending\b/, {
    timeout: ARCHIVE_PROCESSING_TIMEOUT_MS,
  });
  await expect(archiveTitle).toHaveText('Recording 1');

  const downloadButton = page.getByTestId('archive-download-button');
  await expect(downloadButton).toBeVisible();
  const href = await downloadButton.evaluate((element) => element.closest('a')?.href ?? null);
  expect(href).toBeTruthy();
}

async function fulfillSearchArchives({
  route,
  archive,
}: {
  route: Route;
  archive: { status: string; url: string | null };
}): Promise<void> {
  const searchArchivesResult = {
    count: 1,
    items: [
      {
        id: MOCK_ARCHIVE_ID,
        name: 'recording',
        status: archive.status,
        url: archive.url,
        createdAt: Date.now(),
        duration: 12,
        size: 1024 * 1024,
        outputMode: 'composed',
        hasAudio: true,
        hasVideo: true,
        hasTranscription: false,
      },
    ],
  };

  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(
      toTrpcBody({ route, payload: { result: { data: searchArchivesResult } } })
    ),
  });
}

async function fulfillSearchArchivesError(route: Route): Promise<void> {
  const errorPayload = {
    error: {
      message: 'Failed to search archives',
      code: -32603,
      data: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500, path: 'searchArchives' },
    },
  };

  await route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify(toTrpcBody({ route, payload: errorPayload })),
  });
}

function toTrpcBody({ route, payload }: { route: Route; payload: unknown }): unknown {
  const isBatchRequest = new URL(route.request().url()).searchParams.get('batch') === '1';
  return isBatchRequest ? [payload] : payload;
}
