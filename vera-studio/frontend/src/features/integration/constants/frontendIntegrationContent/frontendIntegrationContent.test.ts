import { describe, expect, it } from 'vitest';
import frontendIntegrationContent from './frontendIntegrationContent';

describe('frontendIntegrationContent', () => {
  it('contains room and client sections', () => {
    expect(frontendIntegrationContent.middlePanel.room.content.title).toBeTruthy();
    expect(frontendIntegrationContent.middlePanel.client.content.title).toBeTruthy();
    expect(frontendIntegrationContent.middlePanel.client.content.description2).toBeTruthy();
  });
});
