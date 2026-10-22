import { describe, expect, it } from 'vitest';
import type { ReactElement } from 'react';
import getOverflowMenuButtons from './getOverflowMenuButtons';

const fakeToolbarButtons = [
  { key: 'Button1' },
  { key: 'Button2' },
  { key: 'Button3' },
  { key: 'Button4' },
  { key: 'Button5' },
] as unknown as ReactElement[];

const keysOf = (buttons: ReactElement[]) => buttons.map((button) => button.key);

describe('getOverflowMenuButtons', () => {
  it('returns the last `2` buttons for the overflow menu when `3` are shown in the toolbar', () => {
    expect(keysOf(getOverflowMenuButtons(fakeToolbarButtons, 3))).toEqual(['Button4', 'Button5']);
  });

  it('returns an array with no buttons when all are displayed in the toolbar', () => {
    expect(keysOf(getOverflowMenuButtons(fakeToolbarButtons, 5))).toEqual([]);
  });

  it('returns all buttons for the overflow menu if none are displayed in the toolbar', () => {
    expect(keysOf(getOverflowMenuButtons(fakeToolbarButtons, 0))).toEqual([
      'Button1',
      'Button2',
      'Button3',
      'Button4',
      'Button5',
    ]);
  });

  it('splits by button key so a swapped overflow order cannot drop or duplicate a control', () => {
    const toolbarButtons = [
      { key: 'ScreenSharingButton' },
      { key: 'LayoutButton' },
      { key: 'EmojiGridButton' },
      { key: 'CaptionsButton' },
      { key: 'ArchivingButton' },
    ] as unknown as ReactElement[];
    const overflowButtons = [
      { key: 'ScreenSharingButton' },
      { key: 'LayoutButton' },
      { key: 'CaptionsButton' },
      { key: 'EmojiGridButton' },
      { key: 'ArchivingButton' },
    ] as unknown as ReactElement[];

    const overflow = getOverflowMenuButtons(overflowButtons, 3, toolbarButtons);

    expect(keysOf(overflow)).toEqual(['CaptionsButton', 'ArchivingButton']);
  });
});
