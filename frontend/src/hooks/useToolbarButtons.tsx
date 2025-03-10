import { MutableRefObject, ReactElement, useEffect, useRef, useState } from 'react';
import { RIGHT_PANEL_BUTTON_COUNT } from '../utils/constants';

export type UseToolbarButtonsProps = {
  toolbarRef: MutableRefObject<HTMLDivElement | null>;
  mediaControlsRef: MutableRefObject<HTMLDivElement | null>;
  overFlowAndExitRef: MutableRefObject<HTMLDivElement | null>;
  toolbarButtons: ToolbarButtons;
};

export type ToolbarButtons = Array<ReactElement | null | false>;

export type UseToolbarButtons = {
  centerToolbarButtons: ToolbarButtons;
  rightToolbarButtons: ToolbarButtons;
};

/**
 * React hook to determine which buttons should be displayed on the toolbar.
 * @param {UseToolbarButtonsProps} props - The props for the hook
 *  @property {MutableRefObject<HTMLDivElement | null>} toolbarRef - The ref for the Toolbar
 *  @property {MutableRefObject<HTMLDivElement | null>} mediaControlsRef - The ref for the audio and video controls
 *  @property {MutableRefObject<HTMLDivElement | null>} overFlowAndExitRef - The ref for the overflow and exit buttons
 *  @property {ToolbarButtons} toolbarButtons - The buttons to be rendered on the toolbar
 * @returns {UseToolbarButtons} The center and right toolbar buttons
 */
const useToolbarButtons = ({
  toolbarRef,
  mediaControlsRef,
  overFlowAndExitRef,
  toolbarButtons,
}: UseToolbarButtonsProps): UseToolbarButtons => {
  const [centerToolbarButtons, setCenterToolbarButtons] = useState<ToolbarButtons>([]);
  const [rightToolbarButtons, setRightToolbarButtons] = useState<ToolbarButtons>([]);
  const buttonWidth = 60;

  const observer = useRef(
    new ResizeObserver(() => {
      if (!(toolbarRef.current && mediaControlsRef.current && overFlowAndExitRef.current)) {
        return;
      }

      const toolbarStyle = getComputedStyle(toolbarRef.current);
      const toolbarPadding =
        parseFloat(toolbarStyle.paddingLeft) + parseFloat(toolbarStyle.paddingRight);
      const necessaryComponentsWidth =
        mediaControlsRef.current.clientWidth +
        overFlowAndExitRef.current.clientWidth +
        toolbarPadding;
      const toolbarForExtraButtons = toolbarRef.current.clientWidth - necessaryComponentsWidth;
      const maxButtons = Math.floor(toolbarForExtraButtons / buttonWidth);

      // We reserve a few buttons for the right panel
      const maxButtonsForCenter = toolbarButtons.length - RIGHT_PANEL_BUTTON_COUNT;
      // If there's more buttons able to be displayed, we only display the max for the center of the toolbar
      const centerMaxButtons = maxButtons > maxButtonsForCenter ? maxButtonsForCenter : maxButtons;

      setCenterToolbarButtons(toolbarButtons.slice(0, centerMaxButtons));
      setRightToolbarButtons(toolbarButtons.slice(centerMaxButtons, maxButtons));
    })
  );

  useEffect(() => {
    if (!toolbarRef.current) {
      return;
    }

    observer.current.observe(toolbarRef.current);

    // eslint-disable-next-line consistent-return, react-hooks/exhaustive-deps
    return () => observer.current.disconnect();
  }, [toolbarRef]);

  return { centerToolbarButtons, rightToolbarButtons };
};

export default useToolbarButtons;
