import { ipKeyGenerator, MemoryStore, type Options } from 'express-rate-limit';
import { StatusCode } from 'status-code-enum';
import { ApplicationServerError } from '@api-lib/errors';

const TEN_MINUTES_IN_MILLISECONDS = 10 * 60 * 1000;
const MAX_ANONYMOUS_SESSIONS_PER_WINDOW = 5;

const anonymousSessionCreationStore = new MemoryStore();

anonymousSessionCreationStore.init({ windowMs: TEN_MINUTES_IN_MILLISECONDS } as Options);

async function assertAnonymousSessionCreationLimit({
  ipAddress,
}: {
  ipAddress: string | undefined;
}): Promise<void> {
  const { totalHits } = await anonymousSessionCreationStore.increment(
    ipKeyGenerator(ipAddress ?? '')
  );
  const isWithinLimit = totalHits <= MAX_ANONYMOUS_SESSIONS_PER_WINDOW;

  if (isWithinLimit) return;

  throw new ApplicationServerError({
    src: null,
    fallbackConfig: {
      fallbackMessage: 'Too many sessions created, please try again later.',
      statusCode: StatusCode.ClientErrorTooManyRequests,
    },
  });
}

export default assertAnonymousSessionCreationLimit;
