import React, { createContext, Suspense } from 'react';
import suspenseToken from './helpers/suspenseToken';

export const suspenseContext = createContext<typeof suspenseToken | null>(null);

const Suspense$: React.FC<Parameters<typeof Suspense>[0]> = ({ children, ...props }) => {
  return (
    <suspenseContext.Provider value={suspenseToken}>
      <Suspense {...props}>{children}</Suspense>
    </suspenseContext.Provider>
  );
};

export default Suspense$;
