import { Box as LayoutBox } from 'opentok-layout-js';
import { ForwardedRef, forwardRef, ReactElement, ReactNode } from 'react';
import getBoxStyle from '../../../utils/helpers/getBoxStyle';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';

export type VideoTileProps = {
  'data-testid': string;
  box: LayoutBox | undefined;
  children: ReactNode;
  className?: string;
  hasVideo: boolean;
  id: string;
  isHidden?: boolean;
  isTalking?: boolean;
  onMouseLeave?: () => void;
  onMouseEnter?: () => void;
  isScreenshare?: boolean;
};

/**
 * VideoTile Component
 *
 * A reusable video tile component for publishers and subscribers.
 * @param {VideoTileProps} props - The props for the component
 *  @property {string} 'data-testid' - Used for testing
 *  @property {LayoutBox | undefined} box - Box specifying position and size of tile
 *  @property {ReactNode} children - The content to be rendered
 *  @property {string} className - (optional) - the className for the tile
 *  @property {boolean} hasVideo - whether the video has video
 *  @property {string} id - the id of the tile
 *  @property {boolean} isHidden - (optional) whether the video tile is hidden
 *  @property {boolean} isTalking - (optional) whether the video has measurable audio
 *  @property {() => void} onMouseLeave - (optional) mouseLeave event handler
 *  @property {() => void} onMouseEnter - (optional) mouseEnter event handler
 *  @property {boolean} isScreenShare - (optional) whether the video is a screenshare
 * @returns {ReactElement} - The VideoTile component.
 */
const VideoTile = forwardRef(
  (
    {
      'data-testid': dataTestId,
      box,
      children,
      className,
      hasVideo,
      id,
      isHidden,
      isTalking,
      onMouseEnter,
      onMouseLeave,
      isScreenshare = false,
    }: VideoTileProps,
    ref: ForwardedRef<HTMLDivElement>
  ): ReactElement => {
    const theme = useTheme();

    return (
      <Box
        id={id}
        data-testid={dataTestId}
        className={className}
        sx={{
          position: 'absolute',
          display: isHidden ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...getBoxStyle(box, isScreenshare),
        }}
        onMouseEnter={() => onMouseEnter?.()}
        onMouseLeave={() => onMouseLeave?.()}
      >
        <Box
          ref={ref}
          sx={{
            position: 'relative',
            left: isScreenshare ? 0 : '4px',
            top: isScreenshare ? 0 : '4px',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            borderRadius: theme.shapes.borderRadiusLarge,
            backgroundColor: theme.colors.darkGrey,
            display: hasVideo ? 'block' : 'none',
            ...(isTalking && {
              outline: `2px solid ${theme.colors.primary}`,
            }),
          }}
        />
        <Box
          sx={{
            position: 'relative',
            left: isScreenshare ? 0 : '4px',
            top: isScreenshare ? 0 : '4px',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            borderRadius: theme.shapes.borderRadiusLarge,
            backgroundColor: theme.colors.darkGrey,
            display: hasVideo ? 'none' : 'block',
            ...(isTalking && {
              outline: `2px solid ${theme.colors.primary}`,
            }),
          }}
        />
        {children}
      </Box>
    );
  }
);

export default VideoTile;
