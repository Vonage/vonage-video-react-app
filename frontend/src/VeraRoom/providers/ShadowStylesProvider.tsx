import type { FC, PropsWithChildren } from 'react';
import { useMemo } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

type ShadowStylesProviderProps = PropsWithChildren<{
  shadowRoot: ShadowRoot;
}>;

/**
 * ⚠️ Architectural Warning
 *
 * MUI + Emotion is fundamentally misaligned with this project and this widget.
 *
 * This widget is:
 *   - Shadow DOM–based
 *   - Distributed as an embeddable bundle
 *   - Expected to be lightweight, isolated, and platform-agnostic
 *
 * MUI was designed around global DOM assumptions (document.head injection),
 * runtime CSS generation, and React-specific styling patterns.
 *
 * In this environment, that results in:
 *   - Custom style injection workarounds
 *   - Manual portal container management
 *   - Runtime style serialization and hashing overhead
 *   - Increased bundle size
 *   - Tight coupling to React + Emotion
 *
 * Every additional use of MUI here increases architectural friction
 * and long-term maintenance cost.
 *
 * Do not introduce new MUI usage in this module.
 */
const ShadowStylesProvider: FC<ShadowStylesProviderProps> = ({ shadowRoot, children }) => {
  const emotionCache = useMemo(() => {
    const container = document.createElement('div');
    container.setAttribute('data-emotion-container', 'vera');
    shadowRoot.prepend(container);

    return createCache({
      key: 'vera',
      container,
      prepend: true,
    });
  }, [shadowRoot]);

  return <CacheProvider value={emotionCache}>{children}</CacheProvider>;
};

export default ShadowStylesProvider;
