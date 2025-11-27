import React, { createContext, Suspense } from 'react';
import suspenseToken from './helpers/suspenseToken';

export const suspenseContext = createContext<typeof suspenseToken | null>(null);

/**
 * React `use` is not context-aware, which means that you can use it outside Suspense boundaries.
 * This could make the application crash silently at runtime. To prevent this, we will use Suspense$ and use$ instead.
 *
 * Suspense$ provides context, and use$ will throw if used outside Suspense$ boundaries.
 */
const Suspense$: React.FC<Parameters<typeof Suspense>[0]> = ({ children, ...props }) => {
  return (
    <suspenseContext.Provider value={suspenseToken}>
      <Suspense {...props}>{children}</Suspense>
    </suspenseContext.Provider>
  );
};

export default Suspense$;
