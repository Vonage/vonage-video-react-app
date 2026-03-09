import { act, renderHook as renderHookBase } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import useWaitingRoom from '../useWaitingRoom';
import usePreviewPublisherContext from '../usePreviewPublisherContext';
import useBackgroundPublisherContext from '../useBackgroundPublisherContext';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import { env } from '../../env';

vi.mock('../usePreviewPublisherContext');
vi.mock('../useBackgroundPublisherContext');

const mockInitLocalPublisher = vi.fn();
const mockDestroyPublisher = vi.fn();
const mockInitBackgroundLocalPublisher = vi.fn();

const defaultPreviewContext = {
  initLocalPublisher: mockInitLocalPublisher,
  publisher: null,
  accessStatus: DEVICE_ACCESS_STATUS.ACCEPTED,
  destroyPublisher: mockDestroyPublisher,
  isVideoLoading: false,
};

const defaultBackgroundContext = {
  initBackgroundLocalPublisher: mockInitBackgroundLocalPublisher,
  publisher: null,
};

const mockUsePreviewPublisherContext = usePreviewPublisherContext as Mock;
const mockUseBackgroundPublisherContext = useBackgroundPublisherContext as Mock;

describe('useWaitingRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePreviewPublisherContext.mockReturnValue({ ...defaultPreviewContext });
    mockUseBackgroundPublisherContext.mockReturnValue({ ...defaultBackgroundContext });
    env.WAITING_ROOM_ALLOW_DEVICE_SELECTION = true;
  });

  it('returns all expected fields', () => {
    const { result } = renderHook(() => useWaitingRoom());

    expect(result.current).toMatchObject({
      anchorEl: null,
      openAudioInput: false,
      openVideoInput: false,
      openAudioOutput: false,
      username: expect.any(String),
      setUsername: expect.any(Function),
      accessStatus: DEVICE_ACCESS_STATUS.ACCEPTED,
      isRoomReady: true,
      handleAudioInputOpen: expect.any(Function),
      handleVideoInputOpen: expect.any(Function),
      handleAudioOutputOpen: expect.any(Function),
      handleClose: expect.any(Function),
    });
  });

  it('isRoomReady is false when isVideoLoading is true', () => {
    mockUsePreviewPublisherContext.mockReturnValue({
      ...defaultPreviewContext,
      isVideoLoading: true,
    });

    const { result } = renderHook(() => useWaitingRoom());
    expect(result.current.isRoomReady).toBe(false);
  });

  it('isRoomReady is false when accessStatus is not ACCEPTED', () => {
    mockUsePreviewPublisherContext.mockReturnValue({
      ...defaultPreviewContext,
      accessStatus: DEVICE_ACCESS_STATUS.PENDING,
    });

    const { result } = renderHook(() => useWaitingRoom());
    expect(result.current.isRoomReady).toBe(false);
  });

  it('isRoomReady is false when WAITING_ROOM_ALLOW_DEVICE_SELECTION is false', () => {
    env.WAITING_ROOM_ALLOW_DEVICE_SELECTION = false;

    const { result } = renderHook(() => useWaitingRoom());
    expect(result.current.isRoomReady).toBe(false);
  });

  describe('audio input menu', () => {
    it('handleAudioInputOpen sets anchorEl and opens the menu', () => {
      const { result } = renderHook(() => useWaitingRoom());
      const fakeButton = document.createElement('button');

      act(() => {
        result.current.handleAudioInputOpen({
          currentTarget: fakeButton,
        } as unknown as React.MouseEvent<HTMLButtonElement>);
      });

      expect(result.current.openAudioInput).toBe(true);
      expect(result.current.anchorEl).toBe(fakeButton);
    });

    it('handleClose closes the audio input menu', () => {
      const { result } = renderHook(() => useWaitingRoom());
      const fakeButton = document.createElement('button');

      act(() => {
        result.current.handleAudioInputOpen({
          currentTarget: fakeButton,
        } as unknown as React.MouseEvent<HTMLButtonElement>);
      });

      act(() => {
        result.current.handleClose();
      });

      expect(result.current.openAudioInput).toBe(false);
      expect(result.current.anchorEl).toBeNull();
    });
  });

  describe('video input menu', () => {
    it('handleVideoInputOpen sets anchorEl and opens the menu', () => {
      const { result } = renderHook(() => useWaitingRoom());
      const fakeButton = document.createElement('button');

      act(() => {
        result.current.handleVideoInputOpen({
          currentTarget: fakeButton,
        } as unknown as React.MouseEvent<HTMLButtonElement>);
      });

      expect(result.current.openVideoInput).toBe(true);
      expect(result.current.anchorEl).toBe(fakeButton);
    });
  });

  describe('audio output menu', () => {
    it('handleAudioOutputOpen sets anchorEl and opens the menu', () => {
      const { result } = renderHook(() => useWaitingRoom());
      const fakeButton = document.createElement('button');

      act(() => {
        result.current.handleAudioOutputOpen({
          currentTarget: fakeButton,
        } as unknown as React.MouseEvent<HTMLButtonElement>);
      });

      expect(result.current.openAudioOutput).toBe(true);
      expect(result.current.anchorEl).toBe(fakeButton);
    });
  });

  it('handleClose resets all menus and anchorEl', () => {
    const { result } = renderHook(() => useWaitingRoom());
    const fakeButton = document.createElement('button');

    act(() => {
      result.current.handleAudioOutputOpen({
        currentTarget: fakeButton,
      } as unknown as React.MouseEvent<HTMLButtonElement>);
    });

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.anchorEl).toBeNull();
    expect(result.current.openAudioInput).toBe(false);
    expect(result.current.openAudioOutput).toBe(false);
    expect(result.current.openVideoInput).toBe(false);
  });

  it('setUsername updates the username value', () => {
    const { result } = renderHook(() => useWaitingRoom());

    act(() => {
      result.current.setUsername('New Name');
    });

    expect(result.current.username).toBe('New Name');
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
};

function renderHook<Result>(render: () => Result, { userContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user], { userContext });
  return {
    ...context,
    ...renderHookBase(render, { wrapper }),
  };
}
