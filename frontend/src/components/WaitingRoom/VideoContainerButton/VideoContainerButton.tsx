import IconButton from '@mui/material/IconButton';
import type { IconButtonProps } from '@mui/material/IconButton';
import type { SxProps } from '@mui/material';
import { ForwardedRef, forwardRef, ReactElement } from 'react';
import classNames from 'classnames';
import { twMerge } from 'tailwind-merge';

export type VideoContainerButtonProps = IconButtonProps & {
  onClick: () => void;
  icon: ReactElement;
  sx?: SxProps;
};

/**
 * VideoContainerButton Component
 *
 * An overlay button for the preview publisher.
 * @param {VideoContainerButtonProps} props - The props for the component.
 *  @property {Function} onClick - The on-click handler for the button.
 *  @property {ReactElement} icon - The Icon element for the button.
 *  @property {SxProps} sx - The style properties for the component.
 * @returns {ReactElement} The VideoContainerButton component.
 */
const VideoContainerButton = forwardRef(function VideoContainerButton(
  props: VideoContainerButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
): ReactElement {
  const { icon: Icon, className, ...rest } = props;
  return (
    <IconButton
      {...rest}
      className={classNames(twMerge('w-full h-full', className))}
      data-testid="video-container-button"
      ref={ref}
    >
      {Icon}
    </IconButton>
  );
});

export default VideoContainerButton;
