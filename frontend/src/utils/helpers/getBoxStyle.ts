import { Box } from 'opentok-layout-js';
import { CSSProperties } from 'react';

// VideoTile have a 4px margin each side. This offset is the sum of the margin for each side
// Needed to offset height and width to account for this margin
const VIDEO_TILE_MARGIN = 8;

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
    width: box.width - VIDEO_TILE_MARGIN,
    height: box.height - VIDEO_TILE_MARGIN,
  };

export default getBoxStyle;
