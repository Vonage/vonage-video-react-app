import { createElement, useEffect, useMemo, type PropsWithChildren } from 'react';
import runtimeStore from './runtimeStore';
import { Prettify } from '@common/types';
import { useStableRef } from '@web/hooks';
import { QueryClient } from '@tanstack/react-query';
import { type VideoClient, createVideoClient } from '@core/services';
import { isString } from '@common/assertions';

type RuntimeState = {
  language?: string;
  queryClient?: QueryClient;
  videoClient: VideoClient | string;
};

type RuntimeProviderProps = Prettify<PropsWithChildren<RuntimeState>>;

/**
 * Provides vonage video general configuration and an isolated QueryClient for all runtime hooks.
 * The QueryClient is stored in the runtime store so hooks can access it without React context.
 */
const RuntimeProvider = ({
  children,
  language = 'en',
  videoClient: videoClientParam,
  queryClient: queryClientParam,
}: RuntimeProviderProps) => {
  const clientUrl = isString(videoClientParam) ? videoClientParam : undefined;

  const videoClient = useStableRef((): VideoClient => {
    if (isString(videoClientParam)) {
      return createVideoClient({
        url: clientUrl!,
      });
    }

    return videoClientParam;
  }, [clientUrl]).current;

  const queryClient = useStableRef(() => queryClientParam ?? new QueryClient(), []).current;

  const isExternalClient = !!queryClientParam;

  const value = useMemo(() => {
    return {
      videoClient,
      language,
      queryClient,
    };
  }, [videoClient, language, queryClient]);

  useEffect(() => {
    // avoid cleaning external QueryClients that may be shared with other parts of the app
    if (isExternalClient) return;

    return () => {
      queryClient.clear();
    };
  }, [isExternalClient, queryClient]);

  return createElement(runtimeStore.Provider, { value }, children);
};

export default RuntimeProvider;
