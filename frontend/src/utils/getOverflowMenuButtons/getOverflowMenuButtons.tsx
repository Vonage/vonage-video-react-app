import { Key, ReactElement } from 'react';

/**
 * Returns all of the buttons to be displayed in the toolbar overflow menu.
 * Splits by button key rather than array index so the overflow list can be
 * ordered independently of the toolbar without duplicating or dropping a control.
 * @param {Array<ReactElement | false>} buttons - Overflow-menu buttons
 * @param {number} toolbarButtonsCount - The number of buttons displayed on the toolbar
 * @param {Array<ReactElement | false>} toolbarButtons - Toolbar buttons in display order. Defaults to `buttons`.
 * @returns {Array<ReactElement | false>} - The buttons for the toolbar overflow menu
 */
function getOverflowMenuButtons(
  buttons: Array<ReactElement | false>,
  toolbarButtonsCount: number,
  toolbarButtons: Array<ReactElement | false> = buttons
): Array<ReactElement | false> {
  const shownKeys = new Set<Key | null>(
    toolbarButtons
      .slice(0, toolbarButtonsCount)
      .filter((button): button is ReactElement => Boolean(button))
      .map((button) => button.key)
  );

  return buttons.filter(
    (button) => Boolean(button) && !shownKeys.has((button as ReactElement).key)
  );
}

export default getOverflowMenuButtons;
