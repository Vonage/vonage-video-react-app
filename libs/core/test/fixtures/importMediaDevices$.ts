export type { default as MediaDevices$ } from '@core/stores/devices';

/**
 * Dynamically imports the mediaDevices$ store from the core package.
 */
const importMediaDevices$ = async () => {
  return {
    mediaDevices$: (await import('@core/stores/devices')).default,
  };
};

export default importMediaDevices$;
