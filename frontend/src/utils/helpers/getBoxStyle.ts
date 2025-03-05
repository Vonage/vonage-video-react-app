import { Box } from 'opentok-layout-js';
import { CSSProperties } from 'react';

// VideoTile have a 4px and 8px margin each side. This offset is the sum of the margin for each side
// Needed to offset height and width to account for this margin
const VIDEO_TILE_MARGIN_Y = 8;
const VIDEO_TILE_MARGIN_X = 16;

/**
 * Gets style object for positioning video tiles given a layout box and incorporating a 12px separation
 * @param {(Box | undefined)} box - A Layout Box for the element
 * @returns {CSSProperties | undefined} - Style object or undefined if Box was undefined
 */
const getBoxStyle = (box: Box | undefined): CSSProperties | undefined =>
  box && {
    left: box.left,
    top: box.top,
    // We subtract the margins from width and height
    width: box.width - VIDEO_TILE_MARGIN_X,
    height: box.height - VIDEO_TILE_MARGIN_Y,
    aspectRatio: '16/ 9',
  };

export default getBoxStyle;
