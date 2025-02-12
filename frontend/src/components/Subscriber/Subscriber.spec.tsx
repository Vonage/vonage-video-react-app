import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { Subscriber as OTSubscriber } from '@vonage/client-sdk-video';
import { Box } from 'opentok-layout-js';
import { SubscriberWrapper } from '../../types/session';
import Subscriber from './Subscriber';
import userEvent from '@testing-library/user-event';

describe('Subscriber', () => {
  afterEach(() => {
    cleanup();
  });

  const createSubscriberWrapper = (
    id: string,
    isScreenshare: boolean,
    isPinned: boolean = false
  ): SubscriberWrapper => {
    const videoType = isScreenshare ? 'screen' : 'camera';
    return {
      id,
      element: document.createElement('video'),
      isScreenshare,
      isPinned,
      subscriber: {
        on: vi.fn(),
        off: vi.fn(),
        videoWidth: () => 1280,
        videoHeight: () => 720,
        subscribeToVideo: () => {},
        stream: {
          streamId: id,
          videoType,
        },
      } as unknown as OTSubscriber,
    };
  };

  const createMockBox = (height: number, left: number, top: number, width: number): Box => {
    return {
      height,
      left,
      top,
      width,
    };
  };

  it('should contain an audio indicator component if it is not a screenshare', () => {
    const mockedSubscriberId = '123';
    const subscriberWrapper = createSubscriberWrapper(mockedSubscriberId, false);
    const mockedBox = createMockBox(10, 10, 10, 10);

    render(
      <Subscriber
        subscriberWrapper={subscriberWrapper}
        isHidden={false}
        box={mockedBox}
        isActiveSpeaker={false}
      />
    );

    expect(screen.getByTestId(`subscriber-container-${mockedSubscriberId}`)).toBeVisible();
    expect(screen.getByTestId('audio-indicator')).toBeVisible();
  });

  it('should not contain an audio indicator component if it is a screenshare', () => {
    const mockedSubscriberId = '456';
    const subscriberWrapper = createSubscriberWrapper(mockedSubscriberId, true);
    const mockedBox = createMockBox(10, 10, 10, 10);

    render(
      <Subscriber
        subscriberWrapper={subscriberWrapper}
        isHidden={false}
        box={mockedBox}
        isActiveSpeaker={false}
      />
    );

    expect(screen.getByTestId(`subscriber-container-${mockedSubscriberId}`)).toBeVisible();
    expect(screen.queryByTestId('audio-indicator')).not.toBeInTheDocument();
  });

  it('should render a pin icon if the subscriber is pinned', () => {
    const mockedSubscriberId = 'OT_7a0a1bfd-2892-4f5e-90e0-33dafdc7c373';
    const subscriberWrapper = createSubscriberWrapper(mockedSubscriberId, false, true);
    const mockedBox = createMockBox(10, 10, 10, 10);

    render(
      <Subscriber
        subscriberWrapper={subscriberWrapper}
        isHidden={false}
        box={mockedBox}
        isActiveSpeaker={false}
      />
    );

    expect(screen.getByTestId(`subscriber-container-${mockedSubscriberId}`)).toBeVisible();
    expect(screen.queryByTestId('pin-button')).toBeVisible();
  });

  it('should show pin icon when subscriber is hovered', async () => {
    const mockedSubscriberId = 'OT_7a0a1bfd-2892-4f5e-90e0-33dafdc7c373';
    const subscriberWrapper = createSubscriberWrapper(mockedSubscriberId, false, false);
    const mockedBox = createMockBox(10, 10, 10, 10);

    render(
      <Subscriber
        subscriberWrapper={subscriberWrapper}
        isHidden={false}
        box={mockedBox}
        isActiveSpeaker={false}
      />
    );

    const subscriberContainer = screen.getByTestId(`subscriber-container-${mockedSubscriberId}`);
    expect(screen.queryByTestId('pin-button')).not.toBeInTheDocument();
    await act(() => userEvent.hover(subscriberContainer));
    expect(screen.getByTestId('pin-button')).toBeVisible();
  });

  it('should not render pin icon when screenshare subscriber is hovered', async () => {
    const mockedSubscriberId = 'OT_7a0a1bfd-2892-4f5e-90e0-33dafdc7c373';
    const subscriberWrapper = createSubscriberWrapper(mockedSubscriberId, true);
    const mockedBox = createMockBox(10, 10, 10, 10);

    render(
      <Subscriber
        subscriberWrapper={subscriberWrapper}
        isHidden={false}
        box={mockedBox}
        isActiveSpeaker={false}
      />
    );

    expect(screen.getByTestId(`subscriber-container-${mockedSubscriberId}`)).toBeVisible();
    expect(screen.queryByTestId('pin-button')).not.toBeInTheDocument();
  });
});
