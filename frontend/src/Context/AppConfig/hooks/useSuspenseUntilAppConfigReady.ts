import useSuspenseUntil from '@hooks/useSuspenseUntil';
import { useEffect } from 'react';
import defer from '@utils/defer';
import { wait } from '@utils/idempotentCallbackWithRetry/idempotentCallbackWithRetry';
import appConfig from '../AppConfigContext';

/**
 * Suspends the component or hook until the app configuration is fully loaded.
 * React will trigger an error if there is not a suspense boundary above in the tree.
 */
const useSuspenseUntilAppConfigReady = () => {
  const observable = appConfig.use.observable(({ isAppConfigLoaded }) => isAppConfigLoaded);

  useSuspenseUntil(() => {
    const deferred = defer<void>();

    const stopObserving = () => {
      observable.dispose();
      deferred.resolve();
    };

    queueMicrotask(async () => {
      if (observable.getState()) {
        stopObserving();
      }

      observable.subscribe(async (isAppConfigLoaded) => {
        if (isAppConfigLoaded) {
          stopObserving();
        }
      });
    });

    return deferred.promise;
  }, [observable]);

  useEffect(() => {
    return () => {
      observable.dispose();
    };
  }, [observable]);
};

export default useSuspenseUntilAppConfigReady;
