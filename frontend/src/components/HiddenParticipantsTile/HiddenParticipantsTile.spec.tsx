import { ReactElement } from 'react';
import { fireEvent, render as renderBase } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Subscriber } from '@vonage/client-sdk-video';
import { makeSessionProviderWrapper, type SessionProviderWrapperOptions } from '@test/providers';
import { SubscriberWrapper } from '@app-types/session';
import HiddenParticipantsTile from './index';

describe('HiddenParticipantsTile', () => {
  const box = { height: 100, width: 100, top: 0, left: 0 };
  const hiddenSubscribers = [
    {
      element: document.createElement('video'),
      subscriber: {
        id: '1',
        stream: {
          name: 'John Doe',
          streamId: '1',
          initials: 'JD',
        } as Partial<Subscriber['stream']>,
        getAudioVolume: vi.fn(() => 1),
        getImgData: vi.fn(() => null),
        getStats: vi.fn(),
        getRtcStatsReport: vi.fn(() => Promise.resolve(new Map())),
      } as Partial<Subscriber>,
      isScreenshare: false,
      id: '1',
      isPinned: false,
    },
  ];

  it('should display two hidden participants', async () => {
    const currentHiddenSubscribers = [
      ...hiddenSubscribers,
      {
        element: document.createElement('video'),
        subscriber: {
          id: '2',
          stream: {
            name: 'Jane Smith',
            streamId: '2',
            initials: 'JS',
          } as Partial<Subscriber['stream']>,
          getAudioVolume: vi.fn(() => 1),
          getImgData: vi.fn(() => null),
          getStats: vi.fn(),
          getRtcStatsReport: vi.fn(() => Promise.resolve(new Map())),
        } as Partial<Subscriber>,
        isScreenshare: false,
        id: '2',
        isPinned: false,
      },
    ] as SubscriberWrapper[];

    const { sessionContext, getByTestId, getByText } = render(
      <HiddenParticipantsTile box={box} hiddenSubscribers={currentHiddenSubscribers} />
    );

    // we need to capture it before re-render cause the function doesn't persist across renders
    const toggleParticipantListSpy = vi.mocked(sessionContext.current.toggleParticipantList);

    const button = getByTestId('hidden-participants');
    expect(button).toBeInTheDocument();
    await userEvent.click(button);

    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);

    expect(getByText('JD')).toBeInTheDocument();
    expect(getByText('JS')).toBeInTheDocument();

    expect(toggleParticipantListSpy).toHaveBeenCalled();
  });

  it('should display one hidden participant because the other one is empty', async () => {
    const currentHiddenSubscribers = [...hiddenSubscribers, {}] as SubscriberWrapper[];

    const { sessionContext, getByText, getByTestId, queryByText } = render(
      <HiddenParticipantsTile box={box} hiddenSubscribers={currentHiddenSubscribers} />
    );

    // we need to capture it before re-render cause the function doesn't persist across renders
    const toggleParticipantListSpy = vi.mocked(sessionContext.current.toggleParticipantList);

    const button = getByTestId('hidden-participants');
    expect(button).toBeInTheDocument();
    await userEvent.click(button);

    expect(getByText('JD')).toBeInTheDocument();
    expect(queryByText('JS')).not.toBeInTheDocument();

    expect(toggleParticipantListSpy).toHaveBeenCalled();
  });

  it('does not toggle participant list when showParticipantList is disabled', async () => {
    const currentHiddenSubscribers = [...hiddenSubscribers, {}] as SubscriberWrapper[];

    const { sessionContext, getByTestId } = render(
      <HiddenParticipantsTile box={box} hiddenSubscribers={currentHiddenSubscribers} />,
      {
        appConfigOptions: {
          value: {
            isAppConfigLoaded: false,
            meetingRoomSettings: {
              showParticipantList: false,
            },
          },
        },
      }
    );

    // we need to capture it before re-render cause the function doesn't persist across renders
    const toggleParticipantListSpy = vi.mocked(sessionContext.current.toggleParticipantList);

    const button = getByTestId('hidden-participants');
    expect(button).toBeInTheDocument();
    await userEvent.click(button);

    expect(toggleParticipantListSpy).not.toHaveBeenCalled();
  });
});

function render(ui: ReactElement, options?: SessionProviderWrapperOptions) {
  const { SessionProviderWrapper, sessionContext, appConfigContext } = makeSessionProviderWrapper({
    __onCreated: (sessionContext) => {
      vi.spyOn(sessionContext, 'toggleParticipantList');
    },
    ...options,
  });

  return {
    ...renderBase(ui, { ...options, wrapper: SessionProviderWrapper }),
    appConfigContext,
    sessionContext,
  };
}
