/* eslint-disable react-hooks/rules-of-hooks */
import { use, useContext } from 'react';
import { suspenseContext } from '../SuspenseContext';
import suspenseToken from '../helpers/suspenseToken';

const use$ = <T>(...args: Parameters<typeof use<T>>) => {
  const token = useContext(suspenseContext);
  const isSafelyWrapped = token === suspenseToken;

  if (!isSafelyWrapped) {
    throw new Error('use$ must be used within a Suspense$ Provider');
  }

  return use<T>(...args);
};

export default use$;
