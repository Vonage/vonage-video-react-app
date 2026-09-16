/**
 * Checks if the current browser is WebKit.
 * @returns {boolean} - Returns `true` if the current browser is WebKit, else `false`.
 */
const isWebKit = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('safari') && !userAgent.includes('chrome');
};

export default isWebKit;
