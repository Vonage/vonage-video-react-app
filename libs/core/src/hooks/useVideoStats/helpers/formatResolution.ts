/**
 * Formats a video height into a standard resolution label.
 * @param {number | null} height - The video height in pixels.
 * @returns {string | null} The formatted resolution label (e.g. "720p"), or null if height is not available.
 */
const formatResolution = (height: number | null): string | null => {
  if (height === null) return null;
  return `${height}p`;
};

export default formatResolution;
