import { ReactElement } from 'react';

/**
 * Returns all of the buttons to be displayed in the toolbar overflow menu.
 * @param {ReactElement[]} buttons - All of the buttons that could be rendered
 * @param {number} toolbarButtonsCount - The number of buttons displayed on the toolbar, any excess are displayed in the overflow menu
 * @returns {ReactElement[]} - The buttons for the toolbar overflow menu
 */
export default (buttons: ReactElement[], toolbarButtonsCount: number): ReactElement[] =>
  buttons.filter((_, index) => toolbarButtonsCount <= index);
