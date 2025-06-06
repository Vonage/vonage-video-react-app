import { Box } from 'opentok-layout-js';
import { CSSProperties } from 'react';

// VideoTile have a 4px margin each side. This offset is the sum of the margin for each side
// Needed to offset height and width to account for this margin
const VIDEO_TILE_MARGIN = 8;

/**
 * Gets style object for positioning video tiles given a layout box and incorporating a 12px separation
 * @param {(Box | undefined)} box - A Layout Box for the element
 * @param {boolean} isScreenShare - (optional) Whether the video tile is a screenshare or not
 * @returns {CSSProperties | undefined} - Style object or undefined if Box was undefined
 */
const getBoxStyle = (box: Box | undefined, isScreenShare?: boolean): CSSProperties | undefined =>
  box && {
    left: box.left,
    top: box.top,
    // We subtract the margins from width and height
    width:
      typeof box.width === 'number' && !Number.isNaN(box.width)
        ? box.width - VIDEO_TILE_MARGIN - (isScreenShare ? 0 : 6)
        : 0,
    height:
      typeof box.height === 'number' && !Number.isNaN(box.height)
        ? box.height - VIDEO_TILE_MARGIN
        : 0,
    aspectRatio: '16 / 9',
  };

export default getBoxStyle;
