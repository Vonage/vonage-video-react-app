import { act, renderHook as renderHookBase } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useWaitingRoom from '../useWaitingRoom';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import { env } from '../../env';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

vi.mock('@vonage/client-sdk-video');

vi.mock('../useBackgroundPublisherContext', () => ({
  default: () => ({
    initBackgroundLocalPublisher: vi.fn(),
    publisher: null,
  }),
}));

describe('useWaitingRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    env.WAITING_ROOM_ALLOW_DEVICE_SELECTION = true;

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve([]),
      },
    });

    vi.spyOn(globalThis.navigator.permissions, 'query').mockResolvedValue({
      state: 'granted',
    } as PermissionStatus);
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
    const { result } = renderHook(() => useWaitingRoom(), {
      previewPublisherContext: {
        __interceptor: (ctx) => {
          if (ctx) ctx.isVideoLoading = true;
        },
      },
    });
    expect(result.current.isRoomReady).toBe(false);
  });

  it('isRoomReady is false when accessStatus is not ACCEPTED', () => {
    const { result } = renderHook(() => useWaitingRoom(), {
      previewPublisherContext: {
        __interceptor: (ctx) => {
          if (ctx) ctx.accessStatus = DEVICE_ACCESS_STATUS.PENDING;
        },
      },
    });

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
  previewPublisherContext?: ProviderOptions['PreviewPublisherContext'];
};

function renderHook<Result>(
  render: () => Result,
  { userContext, previewPublisherContext }: RenderOptions = {}
) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.previewPublisher], {
    userContext,
    previewPublisherContext: {
      ...previewPublisherContext,
      __interceptor: (ctx) => {
        if (ctx) {
          ctx.accessStatus = DEVICE_ACCESS_STATUS.ACCEPTED;
          ctx.isVideoLoading = false;
        }
        previewPublisherContext?.__interceptor?.(ctx);
      },
    },
  });

  return {
    ...context,
    ...renderHookBase(render, { wrapper }),
  };
}
