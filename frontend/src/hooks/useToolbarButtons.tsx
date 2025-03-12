import { MutableRefObject, ReactElement, useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';
import ResizeObserverPolyfill from 'resize-observer-polyfill';
import { RIGHT_PANEL_BUTTON_COUNT } from '../utils/constants';

export type UseToolbarButtonsProps = {
  toolbarRef: MutableRefObject<HTMLDivElement | null>;
  mediaControlsRef: MutableRefObject<HTMLDivElement | null>;
  overflowAndExitRef: MutableRefObject<HTMLDivElement | null>;
  rightPanelControlsRef: MutableRefObject<HTMLDivElement | null>;
  toolbarButtons: ToolbarButtons;
};

export type ToolbarButtons = Array<ReactElement | false>;

export type UseToolbarButtons = {
  centerToolbarButtons: ToolbarButtons;
  rightToolbarButtons: ToolbarButtons;
  displayTimeRoomName: boolean;
};

/**
 * React hook to determine which buttons should be displayed on the toolbar.
 * @param {UseToolbarButtonsProps} props - The props for the hook
 *  @property {MutableRefObject<HTMLDivElement | null>} toolbarRef - The ref for the Toolbar
 *  @property {MutableRefObject<HTMLDivElement | null>} mediaControlsRef - The ref for the audio and video controls
 *  @property {MutableRefObject<HTMLDivElement | null>} overflowAndExitRef - The ref for the overflow and exit buttons
 *  @property {MutableRefObject<HTMLDivElement | null>} rightPanelControlsRef - The ref for the right panel buttons
 *  @property {ToolbarButtons} toolbarButtons - The buttons to be rendered on the toolbar
 * @returns {UseToolbarButtons} The center and right toolbar buttons, and whether to display the TimeRoomNameMeetingRoom component
 */
const useToolbarButtons = ({
  toolbarRef,
  mediaControlsRef,
  overflowAndExitRef,
  rightPanelControlsRef,
  toolbarButtons,
}: UseToolbarButtonsProps): UseToolbarButtons => {
  const observer = useRef<ResizeObserver | undefined>();
  const [centerToolbarButtons, setCenterToolbarButtons] = useState<ToolbarButtons>([]);
  const [rightToolbarButtons, setRightToolbarButtons] = useState<ToolbarButtons>([]);
  const [displayTimeRoomName, setDisplayTimeRoomName] = useState<boolean>(false);
  const buttonWidth = 60;

  useEffect(() => {
    if (toolbarRef.current && !observer.current) {
      const throttledSetToolbarButtons = throttle(
        () => {
          if (
            !(
              toolbarRef.current &&
              mediaControlsRef.current &&
              overflowAndExitRef.current &&
              rightPanelControlsRef.current
            )
          ) {
            return;
          }

          const toolbarStyle = window.getComputedStyle(toolbarRef.current);
          const toolbarPadding =
            parseFloat(toolbarStyle.paddingLeft) + parseFloat(toolbarStyle.paddingRight);
          const rightPanelControlsStyle = window.getComputedStyle(rightPanelControlsRef.current);
          const rightPanelMargin = parseFloat(rightPanelControlsStyle.marginLeft);
          const necessaryComponentsWidth =
            mediaControlsRef.current.clientWidth +
            overflowAndExitRef.current.clientWidth +
            toolbarPadding +
            rightPanelMargin;

          const spaceForExtraButtons = Math.max(
            0,
            toolbarRef.current.clientWidth - necessaryComponentsWidth
          );
          const maxButtons = Math.floor(spaceForExtraButtons / buttonWidth);

          // We reserve a few buttons for the right panel
          const maxButtonsForCenter = toolbarButtons.length - RIGHT_PANEL_BUTTON_COUNT;
          // If there's more buttons able to be displayed, we only display the max for the center of the toolbar
          const toolbarCenterLimit =
            maxButtons > maxButtonsForCenter ? maxButtonsForCenter : maxButtons;

          setCenterToolbarButtons(toolbarButtons.slice(0, toolbarCenterLimit));
          setRightToolbarButtons(toolbarButtons.slice(toolbarCenterLimit, maxButtons));
          setDisplayTimeRoomName(maxButtons > toolbarButtons.length + 1);
        },
        100,
        { leading: true, trailing: false }
      );

      observer.current = new ResizeObserverPolyfill(() => {
        throttledSetToolbarButtons();
      });
    }

    if (!(toolbarRef.current && observer.current)) {
      return;
    }

    // The cleanup function may not be pointing to the correct object/ref by the time it executes.
    // We keep its reference so the cleanup function runs correctly.
    const observedToolbar = toolbarRef.current;

    observer.current.observe(toolbarRef.current);

    // eslint-disable-next-line consistent-return
    return () => {
      if (observedToolbar) {
        observer.current?.unobserve(observedToolbar);
      }
    };
  }, [mediaControlsRef, overflowAndExitRef, rightPanelControlsRef, toolbarButtons, toolbarRef]);

  return { centerToolbarButtons, rightToolbarButtons, displayTimeRoomName };
};

export default useToolbarButtons;
