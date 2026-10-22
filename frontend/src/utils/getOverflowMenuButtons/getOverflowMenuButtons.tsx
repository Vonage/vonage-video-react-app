import type { Key, ReactElement } from 'react';

/**
 * Returns all of the buttons to be displayed in the toolbar overflow menu.
 * Splits by button key rather than array index so the overflow list can be
 * ordered independently of the toolbar without duplicating or dropping a control.
 * @param {ReactElement[]} buttons - Overflow-menu buttons
 * @param {number} toolbarButtonsCount - The number of buttons displayed on the toolbar
 * @param {ReactElement[]} toolbarButtons - Toolbar buttons in display order. Defaults to `buttons`.
 * @returns {ReactElement[]} - The buttons for the toolbar overflow menu
 */
function getOverflowMenuButtons(
  buttons: ReactElement[],
  toolbarButtonsCount: number,
  toolbarButtons: ReactElement[] = buttons
): ReactElement[] {
  const shownKeys = new Set<Key | null>(
    toolbarButtons.slice(0, toolbarButtonsCount).map((button) => button.key)
  );

  return buttons.filter((button) => !shownKeys.has(button.key));
}

export default getOverflowMenuButtons;
