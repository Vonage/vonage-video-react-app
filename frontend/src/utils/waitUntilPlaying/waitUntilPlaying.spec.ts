import { describe, expect, it } from 'vitest';
import waitUntilPlaying from '.';
import wait from '@common/execution/wait';

describe('waitUntilPlaying', () => {
  it('should resolve on timeupdate event', async () => {
    const videoElem = document.createElement('video');
    let resolved = false;
    void waitUntilPlaying(videoElem).then(() => {
      resolved = true;
    });
    await wait(0);
    expect(resolved).toBe(false);
    videoElem.dispatchEvent(new Event('timeupdate'));
    await wait(0);
    expect(resolved).toBe(true);
  });

  it('should resolve on loadedmetadata event', async () => {
    const videoElem = document.createElement('video');
    let resolved = false;
    void waitUntilPlaying(videoElem).then(() => {
      resolved = true;
    });
    await wait(0);
    expect(resolved).toBe(false);
    videoElem.dispatchEvent(new Event('loadedmetadata'));
    await wait(0);
    expect(resolved).toBe(true);
  });
  it('should resolve after timeout if no event fired', async () => {
    const videoElem = document.createElement('video');
    let resolved = false;
    void waitUntilPlaying(videoElem, 50).then(() => {
      resolved = true;
    });
    await wait(0);
    expect(resolved).toBe(false);
    await wait(50);
    expect(resolved).toBe(true);
  });
});
