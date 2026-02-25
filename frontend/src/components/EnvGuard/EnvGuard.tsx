import { envInitError } from '../../env';

/**
 * Re-throws any error that occurred when initializing the `env` singleton so
 * that a parent ErrorBoundary can catch it and show a proper fallback.
 * Renders nothing when the env is healthy.
 */
const EnvGuard = () => {
  if (envInitError) {
    throw envInitError;
  }

  return null;
};

export default EnvGuard;
