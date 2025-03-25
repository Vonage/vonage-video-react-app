import { useEffect, Dispatch, SetStateAction } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { HIDE_DROPDOWN_HEIGHT } from '../utils/constants';

/**
 *  Custom hook that observes the window height changes and closes the dropdown
 *  if the height falls below a certain threshold.
 *  @param {Dispatch<SetStateAction<boolean>>} setIsOpen - Sets the state for the component.
 */
const useDropdownResizeObserver = (setIsOpen: Dispatch<SetStateAction<boolean>>) => {
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (window.innerHeight < HIDE_DROPDOWN_HEIGHT) {
        setIsOpen(false);
      }
    });

    observer.observe(document.documentElement);

    return () => observer.disconnect();
  }, [setIsOpen]);
};

export default useDropdownResizeObserver;
