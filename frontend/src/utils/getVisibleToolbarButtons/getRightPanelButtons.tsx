import { ReactElement } from 'react';
import { RIGHT_PANEL_BUTTON_COUNT } from '../constants';

/**
 * Returns all of the right panel buttons to be displayed in the toolbar.
 * @param {Array<ReactElement | false>} buttons - All of the buttons that could be rendered
 * @param {number} shownCount - The number of buttons to be displayed on the toolbar
 * @returns {Array<ReactElement | null | false>} - The buttons for the toolbar
 */
export default (
  buttons: Array<ReactElement | false>,
  shownCount: number
): Array<ReactElement | null | false> =>
  buttons.map((toolbarButton, index) =>
    index >= buttons.length - RIGHT_PANEL_BUTTON_COUNT && shownCount > index ? toolbarButton : null
  );
