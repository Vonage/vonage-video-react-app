import isVcr from './middleware/isVcr';
import isVercel from './middleware/isVercel';
import InMemorySessionStorage from './storage/inMemorySessionStorage';
import { SessionStorage } from './storage/sessionStorage';
import UpstashRedisSessionStorage, {
  getUpstashRedisConfig,
} from './storage/upstashRedisSessionStorage';
import VcrSessionStorage from './storage/vcrSessionStorage';

let sessionService: SessionStorage | null = null;

// Session storage strategy based on where the app is hosted:
// - Vonage Cloud Runtime: VCR instance state
// - Upstash Redis configured (e.g. on Vercel): Upstash Redis over REST
// - otherwise (local development): in-memory
const getSessionStorageService = (): SessionStorage => {
  if (sessionService) return sessionService;

  if (isVcr) {
    return (sessionService = new VcrSessionStorage());
  }

  const upstashRedisConfig = getUpstashRedisConfig();
  if (upstashRedisConfig) {
    return (sessionService = new UpstashRedisSessionStorage(upstashRedisConfig));
  }

  if (isVercel) {
    console.warn(
      'No Upstash Redis database configured on Vercel, falling back to in-memory session storage. ' +
        'State will not be shared between function instances.'
    );
  }

  return (sessionService = new InMemorySessionStorage());
};

export default getSessionStorageService;
