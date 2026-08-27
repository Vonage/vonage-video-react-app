import { useEffect, useState } from 'react';
import {
  hasVideoMediaProcessorSupport,
  hasVideoMediaProcessorSupportAsync,
} from '@utils/hasVideoMediaProcessorSupport';

/**
 * Video-filter support for UI gates. Starts with the sync SDK check, then
 * upgrades to `hasMediaProcessorSupport.promise('video')` when the SDK provides it.
 */
const useHasVideoMediaProcessorSupport = (): boolean => {
  const [supported, setSupported] = useState(() => hasVideoMediaProcessorSupport());

  useEffect(() => {
    let cancelled = false;

    void hasVideoMediaProcessorSupportAsync().then((value) => {
      if (!cancelled) {
        setSupported(value);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return supported;
};

export default useHasVideoMediaProcessorSupport;
