import { mapSourceToState } from '@common/errors/helpers';

export type ApplicationErrorState = import('../../types').ApplicationErrorState;

/**
 * Server-specific version of mapSourceToState.
 * Currently delegates to the common implementation but allows for
 * server-specific mapping logic in the future.
 */
export const mapServerSourceToState = (src: unknown): Partial<ApplicationErrorState> =>
  mapSourceToState(src);

export default mapServerSourceToState;
