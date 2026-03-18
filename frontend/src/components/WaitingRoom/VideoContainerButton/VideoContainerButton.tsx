import IconButton from '@mui/material/IconButton';
import type { SxProps } from '@mui/material';
import classNames from 'classnames';
import { ForwardedRef, forwardRef, ReactElement } from 'react';

export type VideoContainerButtonProps = {
  onClick: () => void;
  icon: ReactElement;
  className?: string;
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
  const { icon: Icon, sx, className, ...rest } = props;
  return (
    <IconButton
      {...rest}
      data-testid="video-container-button"
      ref={ref}
      className={classNames('!h-full !w-full !p-0', className)}
      sx={sx}
    >
      {Icon}
    </IconButton>
  );
});

export default VideoContainerButton;
