import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Subscriber } from '@vonage/client-sdk-video';
import { SessionContextType } from '../../../../../Context/SessionProvider/session';
import useSessionContext from '../../../../../hooks/useSessionContext';
import SingleCaption from './SingleCaption';
import { SubscriberWrapper } from '../../../../../types/session';

vi.mock('../../../../../hooks/useSessionContext');
vi.mock('../../../../../hooks/useReceivingCaptions', () => ({
  default: () => ({
    captionText: '',
    isReceivingCaptions: false,
  }),
}));

vi.useFakeTimers();

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

describe('SingleCaption', () => {
  let sessionContext: SessionContextType;

  const createSubscriberWrapper = (id: string): SubscriberWrapper => {
    const mockSubscriber = {
      id,
      on: vi.fn(),
      off: vi.fn(),
      videoWidth: () => 1280,
      videoHeight: () => 720,
      subscribeToVideo: () => {},
      stream: {
        streamId: id,
      },
    } as unknown as Subscriber;
    return {
      id,
      element: document.createElement('video'),
      isScreenshare: false,
      isPinned: false,
      subscriber: mockSubscriber,
    };
  };

  beforeEach(() => {
    sessionContext = {
      subscriberWrappers: [],
      currentCaptionsId: {
        current: '1-2-3-4',
      },
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContext as unknown as SessionContextType);
  });

  it('renders the caption when receiving captions', () => {
    const { getByText } = render(
      <SingleCaption
        subscriber={createSubscriberWrapper('subscriber-1').subscriber}
        isMobileView={false}
        caption="Test Caption"
      />
    );
    expect(getByText('Test Caption')).toBeInTheDocument();
  });

  it('does not render when no caption is provided', () => {
    const { queryByText } = render(
      <SingleCaption
        subscriber={createSubscriberWrapper('subscriber-1').subscriber}
        isMobileView={false}
        caption=""
      />
    );
    expect(queryByText('Test Caption')).not.toBeInTheDocument();
  });
});
