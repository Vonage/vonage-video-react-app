import useSuspenseUntil from '@hooks/useSuspenseUntil';
import { useEffect } from 'react';
import defer from '@utils/defer';
import appConfig from '../AppConfigContext';

/**
 * Suspends the component or hook until the app configuration is fully loaded.
 */
const useSuspenseUntilAppConfigReady = (): void => {
  const observable = appConfig.use.observable(({ isAppConfigLoaded }) => isAppConfigLoaded);

  useSuspenseUntil(() => {
    const isAppConfigLoaded = observable.getState();

    if (isAppConfigLoaded) {
      return;
    }

    const deferred = defer<void>();

    const stopObserving = () => {
      // stop observing state changes
      observable.dispose();
      deferred.resolve();
    };

    observable.subscribe((isAppConfigLoaded) => {
      if (isAppConfigLoaded) {
        stopObserving();
      }
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
