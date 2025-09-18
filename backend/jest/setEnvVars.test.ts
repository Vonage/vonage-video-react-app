import { describe, expect, test } from '@jest/globals';

describe('Environment Variables', () => {
  test('should have the correct JIRA_API_URL', () => {
    const jiraApiUrl = 'https://example.com';
    expect(process.env.JIRA_API_URL).toBe(jiraApiUrl);
  });

  test('should have the correct JIRA_URL', () => {
    const jiraUrl = 'https://example.com';
    expect(process.env.JIRA_URL).toBe(jiraUrl);
  });

  test('should have the correct JIRA_TOKEN', () => {
    const jiraToken = 'JIRA';
    expect(process.env.JIRA_TOKEN).toBe(jiraToken);
  });

  test('should have the correct JIRA_COMPONENT_ID', () => {
    const jiraComponentId = 'componentId';
    expect(process.env.JIRA_COMPONENT_ID).toBe(jiraComponentId);
  });

  test('should have the correct JIRA_iOS_COMPONENT_ID', () => {
    const jiraComponentId = 'iOSComponentId';
    expect(process.env.JIRA_iOS_COMPONENT_ID).toBe(jiraComponentId);
  });

  test('should have the correct JIRA_ANDROID_COMPONENT_ID', () => {
    const jiraComponentId = 'androidComponentId';
    expect(process.env.JIRA_ANDROID_COMPONENT_ID).toBe(jiraComponentId);
  });

  test('should have the correct JIRA_EPIC_LINK', () => {
    const jiraEpicLink = 'jiraEpicLink';
    expect(process.env.JIRA_EPIC_LINK).toBe(jiraEpicLink);
  });

  test('should have the correct JIRA_EPIC_URL', () => {
    const jiraEpicUrl = 'jiraEpicUrl';
    expect(process.env.JIRA_EPIC_URL).toBe(jiraEpicUrl);
  });

  test('should have the correct VONAGE_APP_ID', () => {
    const vonageAppId = 'vonageAppId';
    expect(process.env.VONAGE_APP_ID).toBe(vonageAppId);
  });

  test('should have the correct VONAGE_PRIVATE_KEY', () => {
    const vonagePrivateKey = 'vonagePrivateKey';
    expect(process.env.VONAGE_PRIVATE_KEY).toBe(vonagePrivateKey);
  });

  test('should have the correct OT_API_KEY', () => {
    const openTokAPIKey = 'someOpenTokKey';
    expect(process.env.OT_API_KEY).toBe(openTokAPIKey);
  });

  test('should have the correct OT_API_SECRET', () => {
    const openTokAPISecret = 'opentokAPISecret';
    expect(process.env.OT_API_SECRET).toBe(openTokAPISecret);
  });
});
