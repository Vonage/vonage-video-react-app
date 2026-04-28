import { describe, expect, it } from 'vitest';
import backendIntegrationContent from './backendIntegrationContent';

describe('backendIntegrationContent', () => {
  it('exposes required middle panel sections', () => {
    expect(backendIntegrationContent.middlePanel.createHandler.content.title).toBeTruthy();
    expect(backendIntegrationContent.middlePanel.expressIntegration.content.title).toBeTruthy();
    expect(
      backendIntegrationContent.middlePanel.advancedUsage.content.examples1.title
    ).toBeTruthy();
  });
});
