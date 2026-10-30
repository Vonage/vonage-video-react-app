import { useMemo, type PropsWithChildren, type ReactElement } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

export type MiniCallWindowStylesProviderProps = PropsWithChildren<{
  targetDocument: Document;
}>;

/**
 * Makes MUI inject its styles into the Picture-in-Picture document.
 * In production Emotion writes rules with `insertRule`, so cloning the opener's
 * `<style>` tags copies them empty.
 * @param {MiniCallWindowStylesProviderProps} props - The PiP document and its content
 * @returns {ReactElement} The content wrapped in an Emotion cache bound to that document
 */
const MiniCallWindowStylesProvider = ({
  targetDocument,
  children,
}: MiniCallWindowStylesProviderProps): ReactElement => {
  const emotionCache = useMemo(
    () => createCache({ key: 'mini-mode', container: targetDocument.head, prepend: true }),
    [targetDocument]
  );

  return <CacheProvider value={emotionCache}>{children}</CacheProvider>;
};

export default MiniCallWindowStylesProvider;
