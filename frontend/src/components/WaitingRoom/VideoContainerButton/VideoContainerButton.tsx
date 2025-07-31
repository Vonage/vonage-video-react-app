import { IconButton, SxProps } from '@mui/material';
import { ForwardedRef, forwardRef, ReactElement } from 'react';

export type VideoContainerButtonProps = {
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
  const { icon: Icon, sx = {}, ...rest } = props;
  return (
    <IconButton
      {...rest}
      data-testid="video-container-button"
      ref={ref}
      sx={{
        height: '100%',
        width: '100%',
        ...sx,
      }}
    >
      {Icon}
    </IconButton>
  );
});

export default VideoContainerButton;
