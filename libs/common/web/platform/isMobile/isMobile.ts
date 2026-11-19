import { UAParser } from 'ua-parser-js';

/**
 * Checks if the current device is mobile.
 * @returns {boolean} - Returns `true` if the current device is mobile, else `false`.
 */
const isMobile = (): boolean => {
  const { userAgent } = navigator;
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();

  return device.type === 'mobile';
};

export default isMobile;
