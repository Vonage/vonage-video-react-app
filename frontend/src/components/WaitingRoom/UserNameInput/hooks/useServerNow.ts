import { useEffect, useState } from 'react';

const tickIntervalMilliseconds = 1000;

/**
 * Current server time in epoch milliseconds, refreshed every second while ticking.
 */
const useServerNow = ({
  clockOffset,
  isTicking,
}: {
  clockOffset: number;
  isTicking: boolean;
}): number => {
  const [now, setNow] = useState(() => Date.now() + clockOffset);

  useEffect(() => {
    if (!isTicking) return;

    const tick = () => setNow(Date.now() + clockOffset);

    tick();
    const intervalId = setInterval(tick, tickIntervalMilliseconds);

    return () => clearInterval(intervalId);
  }, [clockOffset, isTicking]);

  return now;
};

export default useServerNow;
