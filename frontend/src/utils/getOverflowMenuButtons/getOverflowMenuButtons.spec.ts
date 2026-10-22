import { describe, expect, it } from 'vitest';
import { ReactElement } from 'react';
import getOverflowMenuButtons from './getOverflowMenuButtons';

const fakeToolbarButtons = [
  'Button1',
  'Button2',
  'Button3',
  'Button4',
  'Button5',
] as unknown as ReactElement[];

describe('getOverflowMenuButtons', () => {
  it('returns the last `2` buttons for the overflow menu when `3` are shown in the toolbar', () => {
    const expectedResults: Array<string | null> = ['Button4', 'Button5'];

    expect(getOverflowMenuButtons(fakeToolbarButtons, 3)).toEqual(expectedResults);
  });

  it('returns an array with no buttons when all are displayed in the toolbar', () => {
    const expectedResults: Array<string | null> = [];

    expect(getOverflowMenuButtons(fakeToolbarButtons, 5)).toEqual(expectedResults);
  });

  it('returns all buttons for the overflow menu if none are displayed in the toolbar', () => {
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
