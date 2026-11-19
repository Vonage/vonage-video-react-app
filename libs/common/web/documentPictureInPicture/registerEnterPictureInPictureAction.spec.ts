import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerEnterPictureInPictureAction } from './index';

const stubMediaSession = (value: unknown) => {
  Object.defineProperty(navigator, 'mediaSession', {
    value,
    configurable: true,
  });
};

describe('registerEnterPictureInPictureAction', () => {
  afterEach(() => {
    stubMediaSession(undefined);
  });

  it('registers the enterpictureinpicture handler and unregisters on cleanup', () => {
    const setActionHandler = vi.fn();
    stubMediaSession({ setActionHandler });
    const handler = vi.fn();

    const unregister = registerEnterPictureInPictureAction(handler);

    expect(setActionHandler).toHaveBeenCalledWith('enterpictureinpicture', handler);

    unregister();

    expect(setActionHandler).toHaveBeenCalledWith('enterpictureinpicture', null);
  });

  it('returns a no-op when the browser does not know the action', () => {
    const setActionHandler = vi.fn(() => {
      throw new TypeError('Unknown action');
    });
    stubMediaSession({ setActionHandler });

    const unregister = registerEnterPictureInPictureAction(vi.fn());

    expect(typeof unregister).toBe('function');
    expect(() => unregister()).not.toThrow();
    expect(setActionHandler).toHaveBeenCalledTimes(1);
  });

  it('returns a no-op when navigator.mediaSession is unavailable', () => {
    stubMediaSession(undefined);

    const unregister = registerEnterPictureInPictureAction(vi.fn());

    expect(typeof unregister).toBe('function');
    expect(() => unregister()).not.toThrow();
  });
});
