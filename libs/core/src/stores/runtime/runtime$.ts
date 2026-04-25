import type { Prettify } from '@common/types';

import runtimeStore from './runtimeStore';
import RuntimeProvider from './RuntimeProvider';
import { useLanguage, useVideoClient, useQuery } from './hooks';

const extensions = {
  /**
   * Custom Provider that wraps the runtime store provider and an isolated QueryClientProvider.
   * The QueryClient is created on mount and cleared on unmount.
   */
  Provider: RuntimeProvider,

  /**
   * Hook to get the current language from the runtime context.
   */
  useLanguage,

  /**
   * Hook to get the video client from the runtime context.
   */
  useVideoClient,

  /**
   * useQuery bound to the runtime$ isolated QueryClient.
   * Consumers inside runtime$.Provider automatically use the correct QueryClient.
   */
  useQuery,
};

// Spread instead of Object.assign to avoid mutating the runtimeStore object.
// Mutating would replace the store's original Provider, breaking its internal references.
const runtime$ = { ...runtimeStore, ...extensions } as Prettify<
  Omit<typeof runtimeStore, 'select' | 'dispose' | 'subscribers' | 'Provider'> & typeof extensions
>;

export default runtime$;
