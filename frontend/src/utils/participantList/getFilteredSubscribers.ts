import type { SubscriberWrapper } from '../../types/session';
import compareSubscriberByName from './compareSubscriberByName';

type NameMatcher = (name: string) => boolean;

type Args = {
  subscriberWrappers: SubscriberWrapper[];
  nameMatches?: NameMatcher;
};

const getFilteredSubscribers = ({ subscriberWrappers, nameMatches }: Args): SubscriberWrapper[] => {
  return subscriberWrappers
    .filter(({ isScreenshare }) => !isScreenshare)
    .filter((subscriberWrapper) => {
      if (!nameMatches) return true;
      const participantName = subscriberWrapper.subscriber?.stream?.name ?? '';
      return nameMatches(participantName);
    })
    .sort(compareSubscriberByName);
};

export default getFilteredSubscribers;
