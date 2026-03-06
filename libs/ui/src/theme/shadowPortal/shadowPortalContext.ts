import { createContext, useContext } from 'react';

/**
 * Provides an HTMLElement inside the current Shadow DOM root to be used
 * as the portal container for MUI components (Popper, Modal, Popover, etc.).
 *
 * When `null` (default), MUI falls back to `document.body` — which is correct
 * for non-embed usage. In the Shadow DOM embed, `ShadowStylesProvider` populates
 * this with a dedicated container div so that portals render inside the shadow
 * root and receive Emotion/Tailwind styles.
 */
const ShadowPortalContext = createContext<HTMLElement | null>(null);

export const useShadowPortalContainer = () => useContext(ShadowPortalContext);

export default ShadowPortalContext;
