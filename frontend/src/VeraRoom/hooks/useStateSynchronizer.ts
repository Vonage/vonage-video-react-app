import i18n from '../../i18n';
import bridge$ from '../stores/bridge';
import { runtime$ } from '@core/stores';
import { useMountEffect } from '@web/hooks';
import createBridgeVideoClient from '../helpers/createBridgeVideoClient';

/**
 * Syncs the html element with the internal react state
 */
const useStateSynchronizer = () => {
  const bridge = bridge$.use.api();
  const runtime = runtime$.use.api();
  const { setLanguage } = runtime$.use.actions();

  useMountEffect(() => {
    const replaceVideoClient = () => {
      const { videoClient, entryPoint, credentials } = bridge.getState();

      runtime.setState((state) => ({
        ...state,
        videoClient: videoClient ?? createBridgeVideoClient({ entryPoint, credentials }),
      }));
    };

    const subscriptions = [
      // language changes from the bridge should update i18n and the runtime store
      bridge.subscribe(
        ({ language }) => language,
        (language) => {
          void i18n.changeLanguage(language);
          setLanguage(language);
        },
        {
          skipFirst: true,
        }
      ),

      // a host-provided client, or the attributes it's built from, replace the runtime video client
      bridge.subscribe(({ videoClient }) => videoClient, replaceVideoClient, { skipFirst: true }),
      bridge.subscribe(({ entryPoint }) => entryPoint, replaceVideoClient, { skipFirst: true }),
      bridge.subscribe(({ credentials }) => credentials, replaceVideoClient, { skipFirst: true }),
    ];

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  });
};

export default useStateSynchronizer;
