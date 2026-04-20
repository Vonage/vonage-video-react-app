/**
 * Formats a frame rate value into a display string.
 * @param {number | null} frameRate - The frame rate in frames per second.
 * @returns {string | null} The formatted frame rate (e.g. "30fps"), or null if frameRate is not available.
 */
const formatFrameRate = (frameRate: number | null): string | null => {
  if (frameRate === null) return null;
  return `${Math.round(frameRate)}fps`;
};

export default formatFrameRate;
