import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { throttle } from 'lodash';
import ResizeObserverPolyfill from 'resize-observer-polyfill';
import { RIGHT_PANEL_BUTTON_COUNT } from '../utils/constants';

export type UseToolbarButtonsProps = {
  timeRoomNameRef: MutableRefObject<HTMLDivElement | null>;
  toolbarRef: MutableRefObject<HTMLDivElement | null>;
  mediaControlsRef: MutableRefObject<HTMLDivElement | null>;
  overflowAndExitRef: MutableRefObject<HTMLDivElement | null>;
  rightPanelControlsRef: MutableRefObject<HTMLDivElement | null>;
  numberOfToolbarButtons: number;
};

export type UseToolbarButtons = {
  displayTimeRoomName: boolean;
  centerButtonLimit: number;
  rightButtonLimit: number;
};

/**
 * React hook to determine which buttons should be displayed on the toolbar.
 * @param {UseToolbarButtonsProps} props - The props for the hook
 *  @property {MutableRefObject<HTMLDivElement | null>} toolbarRef - The ref for the Toolbar
 *  @property {MutableRefObject<HTMLDivElement | null>} mediaControlsRef - The ref for the audio and video controls
 *  @property {MutableRefObject<HTMLDivElement | null>} overflowAndExitRef - The ref for the overflow and exit buttons
 *  @property {MutableRefObject<HTMLDivElement | null>} rightPanelControlsRef - The ref for the right panel buttons
 * @returns {UseToolbarButtons} The center and right toolbar buttons' limits, and whether to display the TimeRoomNameMeetingRoom component
 */
const useToolbarButtons = ({
  timeRoomNameRef,
  toolbarRef,
  mediaControlsRef,
  overflowAndExitRef,
  rightPanelControlsRef,
  numberOfToolbarButtons,
}: UseToolbarButtonsProps): UseToolbarButtons => {
  const observer = useRef<ResizeObserver | undefined>(undefined);
  const [displayTimeRoomName, setDisplayTimeRoomName] = useState<boolean>(false);

  const [centerButtonLimit, setCenterButtonLimit] = useState<number>(0);
  const [rightButtonLimit, setRightButtonLimit] = useState<number>(0);
  const buttonWidth = 60;

  useEffect(() => {
    if (toolbarRef.current && !observer.current) {
      const throttledSetToolbarButtons = throttle(
        () => {
          if (
            !(
              timeRoomNameRef.current &&
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
          const timeRoomNameStyle = window.getComputedStyle(timeRoomNameRef.current);
          const timeRoomNameMargin = parseFloat(timeRoomNameStyle.marginRight);
          const necessaryComponentsWidth =
            mediaControlsRef.current.clientWidth +
            overflowAndExitRef.current.clientWidth +
            toolbarPadding +
            rightPanelMargin +
            timeRoomNameMargin;

          const spaceForExtraButtons = Math.max(
            0,
            toolbarRef.current.clientWidth - necessaryComponentsWidth
          );
          const maxButtons = Math.floor(spaceForExtraButtons / buttonWidth);

          // We reserve a few buttons for the right panel
          const maxButtonsForCenter = numberOfToolbarButtons - RIGHT_PANEL_BUTTON_COUNT;
          // If there's more buttons able to be displayed, we only display the max for the center of the toolbar
          const toolbarCenterLimit =
            maxButtons > maxButtonsForCenter ? maxButtonsForCenter : maxButtons;

          setDisplayTimeRoomName(maxButtons > numberOfToolbarButtons + 1);
          setCenterButtonLimit(toolbarCenterLimit);
          setRightButtonLimit(Math.min(numberOfToolbarButtons, maxButtons));
        },
        300,
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
  }, [
    mediaControlsRef,
    overflowAndExitRef,
    rightPanelControlsRef,
    numberOfToolbarButtons,
    toolbarRef,
    timeRoomNameRef,
  ]);

  return {
    displayTimeRoomName,
    centerButtonLimit,
    rightButtonLimit,
  };
};

export default useToolbarButtons;
