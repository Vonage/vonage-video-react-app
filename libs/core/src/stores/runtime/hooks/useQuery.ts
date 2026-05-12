import type { QueryKey } from '@tanstack/query-core';
import type { QueryClient, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQuery as useBaseQuery } from '@tanstack/react-query';
import assertNotNil from '@common/assertions/assertNotNil';
import runtimeStore from '../runtimeStore';

/**
 * By default uses vonage sdk isolated QueryClient from runtime store.
 */
const useQuery = <
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClientParam?: QueryClient
): UseQueryResult<TData, TError> => {
  const queryClient = runtimeStore.use.select(({ queryClient }) => queryClientParam ?? queryClient);

  assertNotNil(
    queryClient,
    'runtime$.useQuery: QueryClient is missing. Wrap your app with <runtime$.Provider> from the Vonage SDK or pass queryClient manually.'
  );

  return useBaseQuery(
    {
      staleTime: 300, // prevents double fetch on a short period of time
      ...options,
    },
    queryClient
  );
};

export default useQuery;
