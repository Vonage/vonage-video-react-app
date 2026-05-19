import classNames from 'classnames';
import { useRef, type ComponentProps, type FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAnchorElement, useStableRef } from '@web/hooks';

type PreviewAnchorProps = ComponentProps<'div'> & {};

/**
 * To avoid reload the preview we keep it alive on the root and we use this component as an anchor.
 */
const PreviewAnchor: FC<PreviewAnchorProps> = ({ className, ...props }) => {
  const anchorRef = useRef<HTMLDivElement>(null);

  const elementToAnchor = useStableRef(
    () => document.getElementById('vera-room-preview'),
    () => {},
    []
  );

  useAnchorElement({
    anchorRef: anchorRef,
    target: () => elementToAnchor.current,
    onAttach: () => {
      const iframeContainer = elementToAnchor.current;
      if (!iframeContainer) return;

      iframeContainer.style.visibility = 'visible';
    },
    onDetach: () => {
      const iframeContainer = elementToAnchor.current;
      if (!iframeContainer) return;

      iframeContainer.style.visibility = 'hidden';
    },
  });

  return (
    <div
      ref={anchorRef}
      className={twMerge(
        classNames(
          'PreviewAnchor min-h-125 lg:h-screen flex justify-center items-center',
          className
        )
      )}
      {...props}
    >
      Loading preview...
    </div>
  );
};

export default PreviewAnchor;
