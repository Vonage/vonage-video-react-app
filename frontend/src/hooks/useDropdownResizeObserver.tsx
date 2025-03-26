import { useEffect, Dispatch, SetStateAction } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

export type UseDropdownResizeObserverProps = {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  dropDownRefElement: HTMLElement | null;
};

/**
 *  Custom hook that observes the window height changes and closes the dropdown
 *  if the height falls below a certain threshold.
 *  @param {UseDropdownResizeObserverProps} props - The props for the hook.
 *  @property {Dispatch<SetStateAction<boolean>>} setIsOpen - Sets the state for the component.
 *  @property {HTMLElement | null} dropDownRefElement - The HTML element used to compare the height to the window height.
 */
const useDropdownResizeObserver = ({
  setIsOpen,
  dropDownRefElement,
}: UseDropdownResizeObserverProps) => {
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const dropDownHeight = dropDownRefElement?.offsetHeight || 0;

      // The 15 multiplier accounts for cases where the measured height is lower
      // due to CSS transforms, dynamic rendering, etc.
      if (window.innerHeight < dropDownHeight * 15) {
        setIsOpen(false);
      }
    });

    observer.observe(document.documentElement);

    return () => observer.disconnect();
  }, [setIsOpen, dropDownRefElement]);
};

export default useDropdownResizeObserver;
