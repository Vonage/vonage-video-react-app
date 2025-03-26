// tests/feedback_form.spec.ts
import { expect } from '@playwright/test';
import { test, baseURL } from '../fixtures/testWithLogging';

async function clickOnReportIssueButton(page, isMobile) {
  if (isMobile) {
    console.log(isMobile);
    await page.getByTestId('MoreVertIcon').click();
    await page.mouse.move(0, 0); // Moves cursor to top-left corner to hide tooltip
  }
  // check for the report issue button
  const reportIssueButton = await page.getByTestId('report-issue-button');
  await expect(reportIssueButton).toBeVisible();
  await reportIssueButton.click();
}

test.describe('FeedbackForm Component', () => {
  const isReportIssueEnabled = !!process.env.VITE_ENABLE_REPORT_ISSUE;
  test.skip(!isReportIssueEnabled, 'Skipping tests if report issues are disabled');
  test.beforeEach(async ({ page }) => {
    const roomUrl = `${baseURL}room/test`;
    await page.goto(`${roomUrl}?bypass=true`);
  });

  test('renders the form fields correctly', async ({ page, isMobile }) => {
    await page.waitForSelector('.publisher', { state: 'visible' });

    await clickOnReportIssueButton(page, isMobile);
    // Check for the title input field
    const titleInput = await page.locator('input[name="title"]');
    await expect(titleInput).toBeVisible();

    // Check for the name input field
    const nameInput = await page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();

    // Check for the issue textarea field
    const issueTextarea = await page.locator('textarea[name="issue"]');
    await expect(issueTextarea).toBeVisible();

    // Check for the submit button
    const submitButton = await page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('shows validation error messages when fields are empty', async ({ page, isMobile }) => {
    await clickOnReportIssueButton(page, isMobile);
    // Attempt to submit the form with empty fields
    await page.locator('button[type="submit"]').click();

    // Check for error messages
    await expect(page.locator('text=Title is required')).toBeVisible();
    await expect(page.locator('text=Your name is required')).toBeVisible();
    await expect(page.locator('text=Description is required')).toBeVisible();
  });
});
