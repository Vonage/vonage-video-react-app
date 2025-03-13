import { ReactElement } from 'react';

/**
 * Returns all of the buttons to be displayed in the toolbar overflow menu.
 * @param {Array<ReactElement | false>} buttons - All of the buttons that could be rendered
 * @param {number} toolbarButtonsCount - The number of buttons displayed on the toolbar, any excess are displayed in the overflow menu
 * @returns {Array<ReactElement | false>} - The buttons for the toolbar overflow menu
 */
export default (
  buttons: Array<ReactElement | false>,
  toolbarButtonsCount: number
): Array<ReactElement | false> => buttons.filter((_, index) => toolbarButtonsCount <= index);
