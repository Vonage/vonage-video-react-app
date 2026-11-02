import type { ReactElement } from 'react';

/**
 * Type guard that keeps only the toolbar buttons that are displayed.
 * @param {ReactElement | false} toolbarButton - a toolbar button, or false when it is hidden
 * @returns {boolean} - true when the toolbar button is displayed
 */
const isDisplayableToolbarButton = (
  toolbarButton: ReactElement | false
): toolbarButton is ReactElement => !!toolbarButton;

export default isDisplayableToolbarButton;
