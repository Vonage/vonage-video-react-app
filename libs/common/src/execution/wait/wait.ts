/**
 * Waits for a specified amount of time.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
const wait = (delay: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, delay);
  });

export default wait;
