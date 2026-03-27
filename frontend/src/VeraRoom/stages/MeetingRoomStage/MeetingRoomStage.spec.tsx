import { render as renderBase, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import MeetingRoomStage from './MeetingRoomStage';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

vi.mock('@vonage/client-sdk-video');

vi.mock('@pages/MeetingRoom', () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="meeting-room" data-classname={props.className as string} />
  ),
}));

type RenderOptions = {
  sessionContext?: ProviderOptions['SessionContext'];
  userContext?: ProviderOptions['UserContext'];
};

function render(ui: ReactElement, { sessionContext, userContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.user, providers.session], {
    sessionContext,
    userContext,
  });

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}

describe('MeetingRoomStage', () => {
  beforeEach(() => {
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

  it('renders without crashing', () => {
    render(<MeetingRoomStage />);
    expect(screen.getByTestId('meeting-room')).toBeInTheDocument();
  });

  it('passes h-full w-full className to MeetingRoom', () => {
    render(<MeetingRoomStage />);
    const meetingRoom = screen.getByTestId('meeting-room');
    expect(meetingRoom).toHaveAttribute('data-classname', 'h-full w-full');
  });
});
