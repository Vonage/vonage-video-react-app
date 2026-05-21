import { createElement, useEffect, useMemo, type PropsWithChildren } from 'react';
import runtimeStore from './runtimeStore';
import { Prettify } from '@common/types';
import { useStableRef } from '@web/hooks';
import { QueryClient } from '@tanstack/react-query';
import { type VideoClient, createVideoClient } from '@core/services';
import { isFunction, isString } from '@common/assertions';
import logger, { LoggerProviderConfig } from '@core/logger';

type LoggerProviderArg =
  | LoggerProviderConfig
  | (() => Promise<LoggerProviderConfig> | LoggerProviderConfig);

type RuntimeState = {
  language?: string;
  queryClient?: QueryClient;
  videoClient: VideoClient | string;
  loggerProvider?: LoggerProviderArg;
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
  loggerProvider,
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

  useEffect(
    function cleanupQueryClient() {
      // avoid cleaning external QueryClients that may be shared with other parts of the app
      if (isExternalClient) return;

      return () => {
        queryClient.clear();
      };
    },
    [isExternalClient, queryClient]
  );

  useEffect(
    function syncLogsProvider() {
      if (!loggerProvider) return;

      logger.setup(() => {
        if (isFunction(loggerProvider)) return loggerProvider();
        return loggerProvider;
      });

      return () => {
        logger.reset();
      };
    },
    [loggerProvider]
  );

  return createElement(runtimeStore.Provider, { value }, children);
};

export default RuntimeProvider;
