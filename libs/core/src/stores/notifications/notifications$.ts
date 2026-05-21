import type { Prettify } from '@common/types';
import notificationsStore from './notificationsStore';

// Notifications public namespace
const notifications$ = { ...notificationsStore } as Prettify<
  Omit<typeof notificationsStore, 'select' | 'dispose' | 'subscribers'>
>;

export default notifications$;
