/**
 * Gets the current time and sets it in the format relative to current locale.
 * @param {string} locale - current locale
 * @param {number} [timestamp]  - optional timestamp, if omitted uses current system time
 * @returns {string} formatted time
 */
export const getFormattedTime = (locale: string, timestamp?: number) => {
  const dateTime = timestamp ? new Date(timestamp) : new Date();
  return dateTime.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: 'numeric',
  });
};

/**
 * Gets the current date and sets it in the format relative to current locale.
 * @param {string} locale - current locale
 * @param {number} timestamp - optional timestamp. If omitted used current system time
 * @returns {number} formatted date
 */
export const getFormattedDate = (locale: string, timestamp?: number) => {
  const date = timestamp ? new Date(timestamp) : new Date();
  return date.toLocaleDateString(locale, {
    month: 'short',
    weekday: 'short',
    day: 'numeric',
  });
};
