import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Subscriber } from '@vonage/client-sdk-video';
import { SessionContextType } from '../../../../Context/SessionProvider/session';
import useSessionContext from '../../../../hooks/useSessionContext';
import CaptionsBox from './CaptionsBox';
import { SubscriberWrapper } from '../../../../types/session';

vi.mock('../../../../hooks/useSessionContext');

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

describe('CaptionsBox', () => {
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

  it('renders the captions box correctly', () => {
    sessionContext.connected = true;
    const { getByTestId } = render(
      <CaptionsBox
        subscriberWrappers={[createSubscriberWrapper('subscriber-1')]}
        isCaptionsEnabled
        isMobileView={false}
      />
    );
    expect(getByTestId('captions-box')).toBeInTheDocument();
  });

  it('does not render the captions box when isCaptionsEnabled is false', () => {
    const { queryByTestId } = render(
      <CaptionsBox
        subscriberWrappers={[createSubscriberWrapper('subscriber-1')]}
        isCaptionsEnabled={false}
        isMobileView={false}
      />
    );
    expect(queryByTestId('captions-box')).not.toBeInTheDocument();
  });
});
