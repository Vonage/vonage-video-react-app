import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import {
  cleanup,
  render as renderBase,
  screen,
  within,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { ReactElement } from 'react';
import { Subscriber as OTSubscriber } from '@vonage/client-sdk-video';
import { useNavigate, useLocation } from 'react-router-dom';
import { SubscriberWrapper } from '@app-types/session';
import useRoomShareUrl from '@hooks/useRoomShareUrl';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import ParticipantList from './ParticipantList';

const mockedRoomName = { roomName: 'test-room-name' };

vi.mock('@hooks/useRoomShareUrl');
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
  useParams: () => mockedRoomName,
}));
const mockNavigate = vi.fn();

const createSubscriberWrapper = (
  name: string,
  id: string,
  isScreenshare: boolean = false
): SubscriberWrapper => {
  const videoType = isScreenshare ? 'screen' : 'camera';
  return {
    id,
    element: document.createElement('video'),
    isPinned: false,
    isScreenshare,
    subscriber: {
      videoWidth: () => 1280,
      videoHeight: () => 720,
      subscribeToVideo: () => {},
      on: vi.fn(),
      off: vi.fn(),
      stream: {
        streamId: id,
        videoType,
        name,
      },
    } as unknown as OTSubscriber,
  };
};

const createTestSubscriberWrappers = () => {
  return [
    createSubscriberWrapper('James Holden', 'sub1'),
    // Screen share subscribers should be hidden in list
    createSubscriberWrapper("James Holden's screen", 'sub1', true),
    createSubscriberWrapper('Alex Kamal', 'sub2'),
    createSubscriberWrapper('Chrisjen Avasarala', 'sub3'),
    createSubscriberWrapper('Amos', 'sub4'),
    createSubscriberWrapper('Naomi Nagata', 'sub5'),
    createSubscriberWrapper('', 'sub6'),
  ];
};

describe('ParticipantList', () => {
  let originalClipboard: Clipboard;

  beforeEach(() => {
    originalClipboard = navigator.clipboard;
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
  });
  afterEach(() => {
    Object.assign(navigator, { clipboard: originalClipboard });
    cleanup();
  });

  it('does not render when closed', () => {
    render(<ParticipantList isOpen={false} handleClose={() => {}} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.subscriberWrappers = createTestSubscriberWrappers();
          }
        },
      },
      userContext: {
        __interceptor: (context) => {
          if (context) {
            context.user.defaultSettings.name = 'Local Participant';
          }
        },
      },
    });
    expect(screen.queryByText('Participants')).not.toBeInTheDocument();
  });

  it('copies room share URL to clipboard', async () => {
    (useRoomShareUrl as Mock).mockReturnValue('https://example.com/room123');

    render(<ParticipantList isOpen handleClose={() => {}} />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.subscriberWrappers = createTestSubscriberWrappers();
          }
        },
      },
      userContext: {
        __interceptor: (context) => {
          if (context) {
            context.user.defaultSettings.name = 'Local Participant';
          }
        },
      },
    });

    const copyButton = screen.getByTestId('vivid-icon-copy-line');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/room123');
      expect(screen.getByTestId('vivid-icon-check-sent-line')).toBeInTheDocument();
    });
  });

  it('should display remote participants in alphabetical order with local participant first', () => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useLocation as Mock).mockReturnValue({
      state: mockedRoomName,
    });
    render(<ParticipantList handleClose={() => {}} isOpen />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.subscriberWrappers = createTestSubscriberWrappers();
          }
        },
      },
      userContext: {
        __interceptor: (context) => {
          if (context) {
            context.user.defaultSettings.name = 'Local Participant';
          }
        },
      },
    });

    const namesInOrder = screen
      .getAllByTestId('participant-list-item', { exact: false })
      .map((listItem) => {
        return within(listItem).getByTestId('participant-list-name').textContent;
      });
    expect(namesInOrder).toEqual([
      'Local Participant (You)',
      'Alex Kamal',
      'Amos',
      'Chrisjen Avasarala',
      'James Holden',
      'Naomi Nagata',
      '', // Edge case, empty names go at the bottom
    ]);
  });

  it('filters list by query and hides You when not matching', () => {
    render(<ParticipantList handleClose={() => {}} isOpen />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.subscriberWrappers = createTestSubscriberWrappers();
          }
        },
      },
      userContext: {
        __interceptor: (context) => {
          if (context) {
            context.user.defaultSettings.name = 'Local Participant';
          }
        },
      },
    });

    const input = screen.getByPlaceholderText('Search participants');
    fireEvent.change(input, { target: { value: 'alex' } });

    const names = screen
      .getAllByTestId('participant-list-item', { exact: false })
      .map((el) => within(el).getByTestId('participant-list-name').textContent);

    expect(names).toEqual(['Alex Kamal']);
    expect(screen.queryByText('Local Participant (You)')).not.toBeInTheDocument();
  });

  it('shows You when query matches local participant name (case-insensitive)', () => {
    render(<ParticipantList handleClose={() => {}} isOpen />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.subscriberWrappers = createTestSubscriberWrappers();
          }
        },
      },
      userContext: {
        __interceptor: (context) => {
          if (context) {
            context.user.defaultSettings.name = 'Local Participant';
          }
        },
      },
    });

    const input = screen.getByPlaceholderText('Search participants');
    fireEvent.change(input, { target: { value: 'LOCAL' } });

    const names = screen
      .getAllByTestId('participant-list-item', { exact: false })
      .map((el) => within(el).getByTestId('participant-list-name').textContent);

    expect(names).toEqual(['Local Participant (You)']);
  });

  it('restores full list after clearing query', () => {
    render(<ParticipantList handleClose={() => {}} isOpen />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.subscriberWrappers = createTestSubscriberWrappers();
          }
        },
      },
      userContext: {
        __interceptor: (context) => {
          if (context) {
            context.user.defaultSettings.name = 'Local Participant';
          }
        },
      },
    });

    const input = screen.getByPlaceholderText('Search participants');
    fireEvent.change(input, { target: { value: 'zzz' } });

    expect(screen.queryAllByTestId('participant-list-item', { exact: false }).length).toBe(0);

    fireEvent.change(input, { target: { value: '' } });

    const namesInOrder = screen
      .getAllByTestId('participant-list-item', { exact: false })
      .map((listItem) => {
        return within(listItem).getByTestId('participant-list-name').textContent;
      });
    expect(namesInOrder).toEqual([
      'Local Participant (You)',
      'Alex Kamal',
      'Amos',
      'Chrisjen Avasarala',
      'James Holden',
      'Naomi Nagata',
      '',
    ]);
  });
});

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
