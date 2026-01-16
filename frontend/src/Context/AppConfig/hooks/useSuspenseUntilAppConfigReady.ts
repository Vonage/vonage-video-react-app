import useSuspenseMemo from '@common/hooks/useSuspenseMemo';
import { useEffect } from 'react';
import defer from '@common/execution/defer';
import appConfig from '../AppConfigContext';

/**
 * Suspends the component or hook until the app configuration is fully loaded.
 */
const useSuspenseUntilAppConfigReady = (): void => {
  const observable = appConfig.use.observable(({ isAppConfigLoaded }) => isAppConfigLoaded);

  useSuspenseMemo(() => {
    const isAppConfigLoaded = observable.getState();

    if (isAppConfigLoaded) {
      return null;
    }

    const deferred = defer<void>();

    const unsubscribe = observable.subscribe((isAppConfigLoaded) => {
      if (isAppConfigLoaded) {
        unsubscribe();
        deferred.resolve();
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
