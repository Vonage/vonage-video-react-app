import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook that returns a debounced value.
 * @param {T} value - The value to debounce.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {T} - The debounced value.
 */
const useDebouncedValue = <T>(value: T, delay: number): T => {
  const timeoutRef = useRef<number | null>(null);

  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    clearTimeout(timeoutRef.current!);

    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    timeoutRef.current = Number(timeout);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, delay]);
  return debouncedValue;
};

export default useDebouncedValue;
