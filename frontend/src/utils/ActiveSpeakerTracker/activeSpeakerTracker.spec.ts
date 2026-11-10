import throttle from '@common/execution/throttle';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import ActiveSpeakerTracker from './activeSpeakerTracker';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { waitForEvent } from '../../../../libs/common/node-test/helpers';

vi.mock('@common/execution/throttle');

describe('ActiveSpeakerTracker', () => {
  beforeEach(() => {
    vi.mocked(throttle).mockImplementation((fn) => fn);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('switches once the new speaker stays loudest for the hold time, through pauses between words', () => {
    const activeSpeakerTracker = new ActiveSpeakerTracker();
    const activeSpeakerChangedSpy = vi.fn();
    activeSpeakerTracker.on('activeSpeakerChanged', activeSpeakerChangedSpy);
    const updateLevel = (subscriberId: string, movingAvg: number) =>
      activeSpeakerTracker.onSubscriberAudioLevelUpdated({ subscriberId, movingAvg });

    updateLevel('alice', 0.5);
    expect(activeSpeakerChangedSpy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    updateLevel('alice', 0);
    updateLevel('bob', 0.6);
    vi.advanceTimersByTime(250);
    updateLevel('bob', 0);
    expect(activeSpeakerChangedSpy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(250);
    updateLevel('bob', 0.6);

    expect(activeSpeakerChangedSpy).toHaveBeenCalledTimes(2);
    expect(activeSpeakerChangedSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        newActiveSpeaker: expect.objectContaining({ subscriberId: 'bob' }),
      })
    );
  });

  test('keeps the current speaker when someone else is only briefly louder', () => {
    const activeSpeakerTracker = new ActiveSpeakerTracker();
    const activeSpeakerChangedSpy = vi.fn();
    activeSpeakerTracker.on('activeSpeakerChanged', activeSpeakerChangedSpy);
    const updateLevel = (subscriberId: string, movingAvg: number) =>
      activeSpeakerTracker.onSubscriberAudioLevelUpdated({ subscriberId, movingAvg });

    updateLevel('alice', 0.5);
    activeSpeakerChangedSpy.mockClear();

    vi.advanceTimersByTime(1000);
    updateLevel('alice', 0.5);
    updateLevel('bob', 0.7);
    vi.advanceTimersByTime(300);
    updateLevel('bob', 0);
    vi.advanceTimersByTime(300);
    updateLevel('bob', 0.7);

    expect(activeSpeakerChangedSpy).not.toHaveBeenCalled();
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
    expect(activeSpeakerChangedSpy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
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
    expect(activeSpeakerChangedSpy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(500);
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
