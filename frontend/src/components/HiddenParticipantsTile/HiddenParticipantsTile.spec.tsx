import { ReactElement } from 'react';
import { fireEvent, render as renderBase } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Subscriber } from '@vonage/client-sdk-video';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import { SubscriberWrapper } from '@app-types/session';
import HiddenParticipantsTile from './index';
import { env } from '../../env';

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

    env.partialUpdate({
      SHOW_PARTICIPANT_LIST: false,
    });

    const { sessionContext, getByTestId } = render(
      <HiddenParticipantsTile box={box} hiddenSubscribers={currentHiddenSubscribers} />
    );

    const toggleParticipantListSpy = vi.mocked(sessionContext.current.toggleParticipantList);

    const button = getByTestId('hidden-participants');
    expect(button).toBeInTheDocument();
    await userEvent.click(button);

    expect(toggleParticipantListSpy).not.toHaveBeenCalled();
  });
});

type RenderOptions = {
  sessionContext?: ProviderOptions['SessionContext'];
  userContext?: ProviderOptions['UserContext'];
};

function render(ui: ReactElement, { sessionContext, userContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.session], {
    userContext,
    sessionContext: {
      __onCreated: (context) => {
        vi.spyOn(context, 'toggleParticipantList');
      },
      ...sessionContext,
    },
  });

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
