/**
 * Checks if the browser supports the setSinkId API for audio output selection.
 * @returns {boolean} - Returns `true` if setSinkId is supported, else `false`.
 */
const isSinkIdSupported = () => {
  return 'setSinkId' in HTMLMediaElement.prototype;
};

export default isSinkIdSupported;
