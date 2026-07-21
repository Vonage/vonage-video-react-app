import { useCallback, useMemo, useRef } from 'react';

export type AttemptSignatureGuard = {
  shouldAttempt: (signature: string) => boolean;
  reset: () => void;
};

/**
 * Guards a retrying initializer against re-attempting the IDENTICAL request that just failed.
 *
 * Publisher re-init gates retry whenever their inputs change, but on Safari every getUserMedia
 * re-prompts AND permissions.query is unreliable (a real denial can read as not-denied), so
 * re-running the same failing request would prompt the user in an endless loop. Callers describe
 * each attempt with a signature string (their requested source set); an attempt is allowed only
 * when the signature differs from the last one tried, and `reset` re-arms the guard once the
 * situation genuinely changed (e.g. a publisher acquired media, or a recovery wants a forced
 * rebuild).
 * @returns {AttemptSignatureGuard} `shouldAttempt` (records + allows a new signature, refuses a
 *   repeat) and `reset` (forgets the last attempt).
 */
const useAttemptSignatureGuard = (): AttemptSignatureGuard => {
  const lastAttemptSignatureRef = useRef<string | null>(null);

  const shouldAttempt = useCallback((signature: string): boolean => {
    if (lastAttemptSignatureRef.current === signature) {
      return false;
    }
    lastAttemptSignatureRef.current = signature;
    return true;
  }, []);

  const reset = useCallback(() => {
    lastAttemptSignatureRef.current = null;
  }, []);

  // Stable identity so the guard can sit in consumers' effect dependency arrays without re-running
  // them every render.
  return useMemo(() => ({ shouldAttempt, reset }), [shouldAttempt, reset]);
};

export default useAttemptSignatureGuard;
