import { describe, expect, it } from 'vitest';
import buildContent from './buildContent';

describe('buildContent', () => {
  it('contains build customization copy', () => {
    expect(buildContent.middlePanel.customizeRoom.title).toBe('Customize your room');
    expect(buildContent.middlePanel.customizeRoom.content.description).toContain('design editor');
  });
});
