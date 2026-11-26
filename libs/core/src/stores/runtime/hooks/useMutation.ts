import type { QueryClient, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useMutation as useBaseMutation } from '@tanstack/react-query';
import assertNotNil from '@common/assertions/assertNotNil';
import runtimeStore from '../runtimeStore';

/**
 * By default uses vonage sdk isolated QueryClient from runtime store.
 */
const useMutation = <TData = unknown, TError = Error, TVariables = void, TOnMutateResult = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
  queryClientParam?: QueryClient
): UseMutationResult<TData, TError, TVariables, TOnMutateResult> => {
  const queryClient = runtimeStore.use.select(({ queryClient }) => queryClientParam ?? queryClient);

  assertNotNil(
    queryClient,
    'runtime$.useMutation: QueryClient is missing. Wrap your app with <runtime$.Provider> from the Vonage SDK or pass queryClient manually.'
  );

  return useBaseMutation(options, queryClient);
};

export default useMutation;
