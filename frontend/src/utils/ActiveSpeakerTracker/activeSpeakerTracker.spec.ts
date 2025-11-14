import throttle from 'lodash/throttle';
import { DebouncedFunc } from 'lodash';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ActiveSpeakerTracker from './activeSpeakerTracker';
import { waitForEvent } from '../async';

vi.mock('lodash/throttle');

describe('ActiveSpeakerTracker', () => {
  beforeEach(() => {
    vi.mocked(throttle).mockImplementation((fn) => fn as DebouncedFunc<typeof fn>);
  });

  test('activeSpeakerChanged fired when participant audio level updated', async () => {
    const activeSpeakerTracker = new ActiveSpeakerTracker();
    const activeSpeakerChangedSpy = vi.fn();
    const waitForActiveSpeakerChanged = waitForEvent(
      activeSpeakerTracker,
      'activeSpeakerChanged',
      activeSpeakerChangedSpy
    );
    activeSpeakerTracker.onSubscriberAudioLevelUpdated({
      subscriberId: 'sub1subscriberId',
      movingAvg: 0.5,
    });

    await waitForActiveSpeakerChanged;
    expect(activeSpeakerChangedSpy).toHaveBeenCalledWith({
      previousActiveSpeaker: {
        subscriberId: undefined,
        movingAvg: 0,
        participant: undefined,
      },
      newActiveSpeaker: {
        subscriberId: 'sub1subscriberId',
        movingAvg: 0.5,
      },
    });
  });

  test('activeSpeakerChanged fired when participant audio level is higher than previous', async () => {
    const activeSpeakerTracker = new ActiveSpeakerTracker();

    const activeSpeakerChangedSpy = vi.fn();

    let waitForActiveSpeakerChanged = waitForEvent(
      activeSpeakerTracker,
      'activeSpeakerChanged',
      activeSpeakerChangedSpy
    );

    activeSpeakerTracker.onSubscriberAudioLevelUpdated({
      subscriberId: 'participant1subscriberId',
      movingAvg: 0.5,
    });
    await waitForActiveSpeakerChanged;

    expect(activeSpeakerChangedSpy).toHaveBeenCalledWith({
      previousActiveSpeaker: {
        subscriberId: undefined,
        movingAvg: 0,
      },
      newActiveSpeaker: {
        subscriberId: 'participant1subscriberId',
        movingAvg: 0.5,
      },
    });

    activeSpeakerChangedSpy.mockRestore();

    waitForActiveSpeakerChanged = waitForEvent(
      activeSpeakerTracker,
      'activeSpeakerChanged',
      activeSpeakerChangedSpy
    );

    activeSpeakerTracker.onSubscriberAudioLevelUpdated({
      subscriberId: 'participant2subscriberId',
      movingAvg: 0.6,
    });
    await waitForActiveSpeakerChanged;

    expect(activeSpeakerChangedSpy).toHaveBeenCalledWith({
      previousActiveSpeaker: {
        subscriberId: 'participant1subscriberId',
        movingAvg: 0.5,
      },
      newActiveSpeaker: {
        subscriberId: 'participant2subscriberId',
        movingAvg: 0.6,
      },
    });
  });

  test('activeSpeakerChanged fired when current active speaker leaves', async () => {
    const activeSpeakerTracker = new ActiveSpeakerTracker();

    const activeSpeakerChangedSpy = vi.fn();

    let waitForActiveSpeakerChanged = waitForEvent(
      activeSpeakerTracker,
      'activeSpeakerChanged',
      activeSpeakerChangedSpy
    );

    activeSpeakerTracker.onSubscriberAudioLevelUpdated({
      subscriberId: 'participant1subscriberId',
      movingAvg: 0.5,
    });
    await waitForActiveSpeakerChanged;

    expect(activeSpeakerChangedSpy).toHaveBeenCalledWith({
      previousActiveSpeaker: {
        subscriberId: undefined,
        movingAvg: 0,
      },
      newActiveSpeaker: {
        subscriberId: 'participant1subscriberId',
        movingAvg: 0.5,
      },
    });

    activeSpeakerChangedSpy.mockRestore();

    waitForActiveSpeakerChanged = waitForEvent(
      activeSpeakerTracker,
      'activeSpeakerChanged',
      activeSpeakerChangedSpy
    );

    activeSpeakerTracker.onSubscriberAudioLevelUpdated({
      subscriberId: 'participant2subscriberId',
      movingAvg: 0.6,
    });
    await waitForActiveSpeakerChanged;

    expect(activeSpeakerChangedSpy).toHaveBeenCalledWith({
      previousActiveSpeaker: {
        subscriberId: 'participant1subscriberId',
        movingAvg: 0.5,
      },
      newActiveSpeaker: {
        subscriberId: 'participant2subscriberId',
        movingAvg: 0.6,
      },
    });

    activeSpeakerChangedSpy.mockRestore();

    waitForActiveSpeakerChanged = waitForEvent(
      activeSpeakerTracker,
      'activeSpeakerChanged',
      activeSpeakerChangedSpy
    );

    activeSpeakerTracker.onSubscriberDestroyed('participant2subscriberId');

    await waitForActiveSpeakerChanged;
    expect(activeSpeakerChangedSpy).toHaveBeenCalledWith({
      newActiveSpeaker: {
        subscriberId: 'participant1subscriberId',
        movingAvg: 0.5,
      },
      previousActiveSpeaker: {
        subscriberId: undefined,
        movingAvg: 0,
      },
    });
  });
});
