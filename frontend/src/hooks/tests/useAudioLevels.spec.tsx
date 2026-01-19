import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook as renderHookBase, waitFor } from '@testing-library/react';
import { Publisher } from '@vonage/client-sdk-video';
import EventEmitter from 'events';

import { PublisherContextType } from '../../Context/PublisherProvider';
import useAudioLevels from '../useAudioLevels';
import usePublisherContext from '../usePublisherContext';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';

vi.mock('../usePublisherContext.tsx');

const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;

describe('usePublisherAudioLevels', () => {
  let advanceDateNow: (ms: number) => void;
  let mockPublisher: EventEmitter;

  beforeEach(() => {
    let now = Date.now();

    const dateNowSpy = vi.spyOn(global.Date, 'now').mockReturnValue(now);
    advanceDateNow = (ms) => {
      now += ms;
      dateNowSpy.mockReturnValue(now);
    };

    mockPublisher = new EventEmitter();

    const mockPublisherContext = {
      publisher: mockPublisher as unknown as Publisher,
      isPublishing: true,
    } as PublisherContextType;

    mockUsePublisherContext.mockImplementation(() => mockPublisherContext);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should set the audioLevel correctly', async () => {
    const { result } = renderHook(() => useAudioLevels());
    // initially the audio level is set to 0 in the hook state
    expect(result.current).toBe(0);

    act(() => {
      mockPublisher.emit('audioLevelUpdated', { audioLevel: 0.11 });
    });
    advanceDateNow(50);
    act(() => {
      mockPublisher.emit('audioLevelUpdated', { audioLevel: 0.11 });
    });

    // audio level should now not be 0 given we've received audio level events
    await waitFor(() => expect(result.current).toBeGreaterThan(0));

    advanceDateNow(51);
    act(() => {
      mockPublisher.emit('audioLevelUpdated', { audioLevel: 0.11 });
    });

    await waitFor(() => expect(result.current).toBeGreaterThan(0));
  });

  it('should throttle audio level updates', async () => {
    const { result } = renderHook(() => useAudioLevels());
    expect(result.current).toBe(0);

    act(() => {
      mockPublisher.emit('audioLevelUpdated', { audioLevel: 0.11 });
    });
    advanceDateNow(50);
    act(() => {
      mockPublisher.emit('audioLevelUpdated', { audioLevel: 0.12 });
    });

    await waitFor(() => expect(result.current).toBeGreaterThan(0));

    // Check if the throttling works
    const initialLevel = result.current;

    advanceDateNow(20);
    act(() => {
      mockPublisher.emit('audioLevelUpdated', { audioLevel: 0.13 });
    });

    // Since it's throttled, the level should not have changed yet
    await waitFor(() => expect(result.current).toBe(initialLevel));

    advanceDateNow(100);
    act(() => {
      mockPublisher.emit('audioLevelUpdated', { audioLevel: 0.14 });
    });

    await waitFor(() => expect(result.current).toBeGreaterThan(initialLevel));
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
};

function renderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  { userContext }: RenderOptions = {}
) {
  const { wrapper, ...context } = makeTestProvider([providers.user], {
    userContext,
  });

  return {
    ...context,
    ...renderHookBase(render, { wrapper }),
  };
}
