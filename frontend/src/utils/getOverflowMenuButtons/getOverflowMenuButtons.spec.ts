import { describe, expect, it, vi } from 'vitest';
import { ReactElement } from 'react';
import getOverflowMenuButtons from './getOverflowMenuButtons';

vi.mock('../constants', () => ({
  RIGHT_PANEL_BUTTON_COUNT: 2,
}));

const fakeToolbarButtons = [
  'Button1',
  'Button2',
  'Button3',
  'Button4',
  'Button5',
] as unknown as Array<ReactElement | false>;

describe('getOverflowMenuButtons', () => {
  it('returns the last `2` buttons when `3` are shown', () => {
    const expectedResults: Array<string | null> = [null, null, null, 'Button4', 'Button5'];

    expect(getOverflowMenuButtons(fakeToolbarButtons, 3)).toEqual(expectedResults);
  });

  it('returns an array with no buttons when all are displayed in the toolbar', () => {
    const expectedResults: Array<string | null> = [null, null, null, null, null];

    expect(getOverflowMenuButtons(fakeToolbarButtons, 5)).toEqual(expectedResults);
  });

  it('returns all buttons if none are to be displayed in the toolbar', () => {
    const expectedResults: Array<string | null> = [
      'Button1',
      'Button2',
      'Button3',
      'Button4',
      'Button5',
    ];

    expect(getOverflowMenuButtons(fakeToolbarButtons, 0)).toEqual(expectedResults);
  });
});
