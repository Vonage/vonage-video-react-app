import React, { createContext, Suspense } from 'react';

const suspenseToken = Symbol('suspense$');

export const suspenseContext = createContext<typeof suspenseToken | null>(null);

/**
 * React `use` is not context-aware, which means that you can use it outside Suspense boundaries.
 * This could make the application crash silently at runtime. To prevent this, we will use SuspenseBoundary and use$ instead.
 *
 * SuspenseBoundary provides context, and use$ will throw if used outside SuspenseBoundary.
 */
const SuspenseBoundary: React.FC<Parameters<typeof Suspense>[0]> = ({ children, ...props }) => {
  return (
    <suspenseContext.Provider value={suspenseToken}>
      <Suspense {...props}>{children}</Suspense>
    </suspenseContext.Provider>
  );
};

export { suspenseToken };
export default SuspenseBoundary;
