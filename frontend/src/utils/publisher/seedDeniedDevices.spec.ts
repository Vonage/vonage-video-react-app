import { describe, expect, it } from 'vitest';
import type { AccessDeniedEvent } from '@Context/PublisherProvider/usePublisher/usePublisher';
import type { DeviceKind } from './deviceAccess';
import seedDeniedDevices from './seedDeniedDevices';

const makeEvent = (partial: Partial<AccessDeniedEvent>): AccessDeniedEvent =>
  partial as AccessDeniedEvent;

describe('seedDeniedDevices', () => {
  it('flags every device named in the structured deniedSources', () => {
    expect(seedDeniedDevices(makeEvent({ deniedSources: ['microphone', 'camera'] }))).toEqual({
      microphone: true,
      camera: true,
    });
  });

  it('flags only the reported device when a single source is named', () => {
    expect(seedDeniedDevices(makeEvent({ deniedSources: ['microphone'] }))).toEqual({
      microphone: true,
      camera: false,
    });
  });

  it('ignores unknown sources (e.g. screenshare "device") without flagging camera/mic', () => {
    expect(
      seedDeniedDevices(makeEvent({ deniedSources: ['device'] as unknown as DeviceKind[] }))
    ).toEqual({
      microphone: false,
      camera: false,
    });
  });

  it('seeds just the microphone from a mid-call message that names it (unpatched SDK)', () => {
    expect(
      seedDeniedDevices(makeEvent({ message: 'microphone permission denied during the call' }))
    ).toEqual({ microphone: true, camera: false });
  });

  it('seeds just the camera from a mid-call message that names it (unpatched SDK)', () => {
    expect(
      seedDeniedDevices(makeEvent({ message: 'camera permission denied during the call' }))
    ).toEqual({ microphone: false, camera: true });
  });

  it('seeds BOTH for the generic init message that names no device (unpatched SDK)', () => {
    expect(
      seedDeniedDevices(makeEvent({ message: 'device permission denied while initializing' }))
    ).toEqual({ microphone: true, camera: true });
  });

  it('seeds BOTH when the message is absent', () => {
    expect(seedDeniedDevices(makeEvent({ message: undefined }))).toEqual({
      microphone: true,
      camera: true,
    });
  });
});
