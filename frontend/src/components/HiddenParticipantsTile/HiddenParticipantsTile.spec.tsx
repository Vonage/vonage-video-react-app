import React from 'react';
import { fireEvent, render as renderBase, RenderOptions, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Subscriber } from '@vonage/client-sdk-video';
import { ConfigProviderBase } from '@Context/ConfigProvider/ConfigProvider';
import AppConfigStore from '@Context/ConfigProvider/AppConfigStore';
import { SubscriberWrapper } from '../../types/session';
import HiddenParticipantsTile from './index';

const mockToggleParticipantList = vi.fn();
vi.mock('../../hooks/useSessionContext', () => ({
  __esModule: true,
  default: () => ({
    toggleParticipantList: mockToggleParticipantList,
  }),
}));

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

    render(<HiddenParticipantsTile box={box} hiddenSubscribers={currentHiddenSubscribers} />);

    const button = screen.getByTestId('hidden-participants');
    expect(button).toBeInTheDocument();
    await userEvent.click(button);

    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('JS')).toBeInTheDocument();

    expect(mockToggleParticipantList).toHaveBeenCalled();
  });

  it('should display one hidden participant because the other one is empty', async () => {
    const currentHiddenSubscribers = [...hiddenSubscribers, {}] as SubscriberWrapper[];

    render(<HiddenParticipantsTile box={box} hiddenSubscribers={currentHiddenSubscribers} />);

    const button = screen.getByTestId('hidden-participants');
    expect(button).toBeInTheDocument();
    await userEvent.click(button);

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.queryByText('JS')).not.toBeInTheDocument();

    expect(mockToggleParticipantList).toHaveBeenCalled();
  });

  it('does not toggle participant list when showParticipantList is disabled', async () => {
    const currentHiddenSubscribers = [...hiddenSubscribers, {}] as SubscriberWrapper[];
    const configStore = new AppConfigStore({
      meetingRoomSettings: { showParticipantList: false },
    });

    render(<HiddenParticipantsTile box={box} hiddenSubscribers={currentHiddenSubscribers} />, {
      wrapper: makeProvidersWrapper({ configStore }),
    });

    const button = screen.getByTestId('hidden-participants');
    expect(button).toBeInTheDocument();
    await userEvent.click(button);

    expect(mockToggleParticipantList).not.toHaveBeenCalled();
  });
});

function render(ui: React.ReactElement, options?: RenderOptions) {
  const Wrapper = options?.wrapper ?? makeProvidersWrapper();
  return renderBase(ui, { ...options, wrapper: Wrapper });
}

function makeProvidersWrapper(providers?: { configStore?: AppConfigStore }) {
  const configStore =
    providers?.configStore ??
    new AppConfigStore({
      meetingRoomSettings: { showParticipantList: true },
    });

  const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <ConfigProviderBase value={configStore}>{children}</ConfigProviderBase>
  );

  return Wrapper;
}
