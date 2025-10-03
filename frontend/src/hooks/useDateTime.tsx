import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFormattedDate, getFormattedTime } from '../utils/dateTime';
/**
 * @typedef {object} UseDateTimeType
 * @property {string} date - The condensed date (e.g., "Wed, Jun 26")
 * @property {string} time - The (standard) time ("6:29 PM")
 */

/**
 * Hook for getting the date and time at the moment. The time is updated every second.
 * @returns {UseDateTimeType} the date and time
 */
const useDateTime = () => {
  const { i18n } = useTranslation();
  const [date, setDate] = useState('Wed, Jun 26');
  const [time, setTime] = useState('5:01 PM');
  /**
   * Gets the current time and sets it in the format of "6:29 PM".
   */
  const updateTime = useCallback(() => {
    const formattedTime = getFormattedTime(i18n.language);
    setTime(formattedTime);
  }, [i18n.language]);

  /**
   * Gets the current date and sets it in the format of "Wed, Jun 26".
   */
  const updateDate = useCallback(() => {
    const formattedDate = getFormattedDate(i18n.language);
    setDate(formattedDate);
  }, [i18n.language]);

  /**
   * Re-sets the time every second.
   */
  const changeTime = useCallback(() => {
    const interval = setInterval(updateTime, 1_000);
    return () => clearInterval(interval);
  }, [updateTime]);

  useEffect(() => {
    updateTime();
    updateDate();
    changeTime();
  }, [changeTime, updateTime, updateDate]);

  return {
    date,
    time,
  };
};

export default useDateTime;
