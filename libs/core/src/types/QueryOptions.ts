import { UseQueryOptions } from '@tanstack/react-query';

export type QueryOptions<TQueryFnData, TData> = Omit<
  UseQueryOptions<TQueryFnData, unknown, TData>,
  'queryFn' | 'queryKey'
>;

export default QueryOptions;
