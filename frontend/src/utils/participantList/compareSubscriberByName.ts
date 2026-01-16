import type { SubscriberWrapper } from '../../types/session';

const compareSubscriberByName = (a: SubscriberWrapper, b: SubscriberWrapper): number => {
  const nameA = a.subscriber?.stream?.name;
  const nameB = b.subscriber?.stream?.name;
  if (!nameA) return 1;
  if (!nameB) return -1;
  return nameA.localeCompare(nameB);
};

export default compareSubscriberByName;
