/**
 * Waits for a specified of time
 * @param {number} delayMs - the number of milliseconds to wait
 * @returns {Promise<void>} a promise that resolves after the delay has elapsed
 */
const delay = (delayMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delayMs);
  });
export default delay;
