import { createVideoClient } from '@core/services';
import i18n from '../../i18n';
import bridge$ from '../stores/bridge';
import { runtime$ } from '@core/stores';
import { useMountEffect } from '@web/hooks';

/**
 * Syncs the html element with the internal react state
 */
const useStateSynchronizer = () => {
  const bridge = bridge$.use.api();
  const runtime = runtime$.use.api();
  const { setLanguage } = runtime$.use.actions();

  useMountEffect(() => {
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

      // clientUrl changes from the bridge should update the video client in the runtime store
      bridge.subscribe(
        ({ entryPoint }) => entryPoint,
        (entryPoint) => {
          runtime.setState((state) => ({
            ...state,
            videoClient: createVideoClient({
              url: entryPoint,
            }),
          }));
        },
        {
          skipFirst: true,
        }
      ),
    ];

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  });
};

export default useStateSynchronizer;
