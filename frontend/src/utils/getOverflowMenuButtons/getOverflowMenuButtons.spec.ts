import { describe, expect, it, vi } from 'vitest';
import { ReactElement } from 'react';
import getOverflowMenuButtons from './getOverflowMenuButtons';

vi.mock('../constants', () => ({
  RIGHT_PANEL_BUTTON_COUNT: 2,
}));

const fakeToolbarButtons = [
  { key: 'Button1' },
  { key: 'Button2' },
  { key: 'Button3' },
  { key: 'Button4' },
  { key: 'Button5' },
] as unknown as Array<ReactElement | false>;

const keysOf = (buttons: Array<ReactElement | false>) =>
  buttons.map((button) => (button as ReactElement).key);

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
    ] as unknown as Array<ReactElement | false>;
    const overflowButtons = [
      { key: 'ScreenSharingButton' },
      { key: 'LayoutButton' },
      { key: 'CaptionsButton' },
      { key: 'EmojiGridButton' },
      { key: 'ArchivingButton' },
    ] as unknown as Array<ReactElement | false>;

    const overflow = getOverflowMenuButtons(overflowButtons, 3, toolbarButtons);

    expect(overflow.map((button) => (button as ReactElement).key)).toEqual([
      'CaptionsButton',
      'ArchivingButton',
    ]);
  });
});
