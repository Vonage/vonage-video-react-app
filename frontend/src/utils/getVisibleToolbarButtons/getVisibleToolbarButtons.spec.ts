import { describe, expect, it, vi } from 'vitest';
import { ReactElement } from 'react';
import getCenterToolbarButtons from './getCenterToolbarButtons';
import getRightPanelButtons from './getRightPanelButtons';
import getOverflowMenuButtons from './getOverflowMenuButtons';

vi.mock('../constants', () => ({
  RIGHT_PANEL_BUTTON_COUNT: 2,
}));

describe('getVisibleToolbarButtons', () => {
  const fakeToolbarButtons = [
    'Button1',
    'Button2',
    'Button3',
    'Button4',
    'Button5',
  ] as unknown as Array<ReactElement | false>;

  describe('getCenterToolbarButtons', () => {
    it('returns the first `2` buttons', () => {
      const expectedResults: Array<string | null> = ['Button1', 'Button2', null, null, null];

      expect(getCenterToolbarButtons(fakeToolbarButtons, 2)).toEqual(expectedResults);
    });

    it('returns an array with no buttons when they should not be shown', () => {
      const expectedResults: Array<string | null> = [null, null, null, null, null];

      expect(getCenterToolbarButtons(fakeToolbarButtons, 0)).toEqual(expectedResults);
    });

    it('returns all buttons if more space is available than buttons', () => {
      // We reserve two buttons for the right panel
      const expectedResults: Array<string | null> = ['Button1', 'Button2', 'Button3', null, null];

      expect(getCenterToolbarButtons(fakeToolbarButtons, 9000)).toEqual(expectedResults);
    });
  });

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

  describe('getRightPanelButtons', () => {
    it('returns the last `2` buttons when all buttons are shown', () => {
      const expectedResults: Array<string | null> = [null, null, null, 'Button4', 'Button5'];

      expect(getRightPanelButtons(fakeToolbarButtons, 5)).toEqual(expectedResults);
    });

    it('returns an array with no buttons when they should be hidden', () => {
      const expectedResults: Array<string | null> = [null, null, null, null, null];

      expect(getRightPanelButtons(fakeToolbarButtons, 3)).toEqual(expectedResults);
    });

    it('returns all buttons if more space is available than buttons', () => {
      const expectedResults: Array<string | null> = [null, null, null, 'Button4', 'Button5'];

      expect(getRightPanelButtons(fakeToolbarButtons, 5)).toEqual(expectedResults);
    });
  });
});
