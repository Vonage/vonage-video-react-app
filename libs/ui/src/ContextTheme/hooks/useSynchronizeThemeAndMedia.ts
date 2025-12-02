import useStableRef from '@hooks/useStableRef';
import React, { useEffect } from 'react';
import isDarkMode from '../helpers/isDarkMode';
import getTokensByMode, { type ThemeTokens } from '../helpers/getTokensByMode';

const useSynchronizeThemeAndMedia = ({
  setTokens,
}: {
  setTokens: React.Dispatch<React.SetStateAction<ThemeTokens>>;
}) => {
  const modeRef = useStableRef(() => (isDarkMode() ? 'dark' : 'light'), [{}]);

  useEffect(() => {
    const isMatchMediaSupported = !!globalThis.matchMedia;

    if (!isMatchMediaSupported) {
      return;
    }

    const toggleTheme = () => {
      const newMode = isDarkMode() ? 'dark' : 'light';
      const didChange = modeRef.current !== newMode;

      if (!didChange) {
        return;
      }

      setTokens(getTokensByMode(newMode));
    };

    const subscribeToMediaChanges = () => {
      const abort = new AbortController();
      const media = globalThis.matchMedia('(prefers-color-scheme: dark)');

      media.addEventListener('change', toggleTheme);

      return () => {
        abort.abort();
      };
    };

    return subscribeToMediaChanges();
  }, [modeRef, setTokens]);
};

export default useSynchronizeThemeAndMedia;
