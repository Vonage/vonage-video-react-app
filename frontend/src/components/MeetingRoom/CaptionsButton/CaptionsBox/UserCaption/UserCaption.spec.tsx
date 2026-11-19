import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Subscriber } from '@vonage/client-sdk-video';
import { SessionContextType } from '../../../../../Context/SessionProvider/session';
import useSessionContext from '../../../../../hooks/useSessionContext';
import UserCaption from './UserCaption';
import { SubscriberWrapper } from '../../../../../types/session';

vi.mock('../../../../../hooks/useSessionContext');
const mockReceivingCaptions = vi.hoisted(() => ({
  current: { caption: '', isReceivingCaptions: false },
}));
vi.mock('../../../../../hooks/useReceivingCaptions', () => ({
  default: () => mockReceivingCaptions.current,
}));

vi.useFakeTimers();

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

describe('UserCaption', () => {
  let sessionContext: SessionContextType;

  const createSubscriberWrapper = (id: string): SubscriberWrapper => {
    const mockSubscriber = {
      id,
      on: vi.fn(),
      off: vi.fn(),
      videoWidth: () => 1280,
      videoHeight: () => 720,
      subscribeToVideo: () => {},
      getCaptionsTranslationLanguage: () => null,
      setCaptionsTranslationLanguage: vi.fn().mockResolvedValue(undefined),
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

  it('renders the speaker name and caption when receiving captions', () => {
    mockReceivingCaptions.current = { caption: 'Test Caption', isReceivingCaptions: true };

    const { getByText } = render(
      <UserCaption
        subscriber={createSubscriberWrapper('subscriber-1').subscriber}
        speakerName="Alice"
        isSmallViewPort={false}
      />
    );

    expect(getByText('Alice:')).toBeInTheDocument();
    expect(getByText('Test Caption')).toBeInTheDocument();
  });

  it('does not render when no caption is received', () => {
    mockReceivingCaptions.current = { caption: '', isReceivingCaptions: false };

    const { queryByText } = render(
      <UserCaption
        subscriber={createSubscriberWrapper('subscriber-1').subscriber}
        speakerName="Alice"
        isSmallViewPort={false}
      />
    );

    expect(queryByText('Alice:')).not.toBeInTheDocument();
  });
});
