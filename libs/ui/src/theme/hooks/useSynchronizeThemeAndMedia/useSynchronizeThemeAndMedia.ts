import isDarkMode from '../../helpers/isDarkMode';
import useStableRef from '@web/hooks/useStableRef';
import useMountEffect from '@web/hooks/useMountEffect';

const VERA_DARK_MODE_CLASSES = ['vera-dark-mode', 'dark'];

const useSynchronizeThemeAndMedia = () => {
  const modeRef = useStableRef<'light' | 'dark'>(isDarkMode() ? 'dark' : 'light');

  useMountEffect(() => {
    const isMatchMediaSupported = !!globalThis.matchMedia;

    if (!isMatchMediaSupported) {
      return;
    }

    const setDocumentMode = (mode: 'light' | 'dark') => {
      const { documentElement } = globalThis.document;

      if (mode === 'dark') {
        documentElement.classList.add(...VERA_DARK_MODE_CLASSES);
        return;
      }

      documentElement.classList.remove(...VERA_DARK_MODE_CLASSES);
    };

    const toggleTheme = () => {
      const newMode = isDarkMode() ? 'dark' : 'light';
      const didChange = modeRef.current !== newMode;

      if (!didChange) return;

      modeRef.current = newMode;
      setDocumentMode(newMode);
    };

    const subscribeToMediaChanges = () => {
      const abort = new AbortController();
      const media = globalThis.matchMedia('(prefers-color-scheme: dark)');

      media.addEventListener('change', toggleTheme, abort);

      return () => abort.abort();
    };

    setDocumentMode(modeRef.current);

    return subscribeToMediaChanges();
  });
};

export default useSynchronizeThemeAndMedia;
