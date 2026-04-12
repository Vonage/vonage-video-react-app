import isVcr from './middleware/isVcr';
import InMemorySessionStorage from './storage/inMemorySessionStorage';
import { SessionStorage } from './storage/sessionStorage';
import VcrSessionStorage from './storage/vcrSessionStorage';

let sessionService: SessionStorage | null = null;

// Session storage strategy based on whether you use Vonage Cloud Runtime for hosting or run the app locally
const getSessionStorageService = (): SessionStorage => {
  if (sessionService) return sessionService;

  if (isVcr) {
    return (sessionService = new VcrSessionStorage());
  }

  return (sessionService = new InMemorySessionStorage());
};

export default getSessionStorageService;
