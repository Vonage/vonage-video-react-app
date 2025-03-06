import { ReactElement } from 'react';

/**
 * Returns all of the buttons to be displayed in the toolbar overflow menu.
 * @param {Array<ReactElement | false>} buttons - All of the buttons that could be rendered
 * @param {number} shownCount - The number of buttons displayed on the toolbar, any excess are hidden
 * @returns {Array<ReactElement | null | false>} - The buttons for the toolbar overflow menu
 */
export default (
  buttons: Array<ReactElement | false>,
  shownCount: number
): Array<ReactElement | null | false> =>
  buttons.map((overflowButton, index) => (shownCount <= index ? overflowButton : null));
