import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Subscriber } from '@vonage/client-sdk-video';
import { SubscriberWrapper } from '../../../types/session';
import ParticipantListItemMenu from '.';
import useSessionContext from '../../../hooks/useSessionContext';
import { SessionContextType } from '../../../Context/SessionProvider/session';

vi.mock('../../../hooks/useSessionContext');

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

describe('ParticipantListItem', () => {
  let mockSessionContext: SessionContextType;

  const mockSubscriberWrapper: SubscriberWrapper = {
    id: 'subId',
    isPinned: false,
    isScreenshare: false,
    subscriber: {} as Subscriber,
    element: {} as HTMLVideoElement,
  };
  const defaultProps = {
    participantName: 'John Doe',
    subscriberWrapper: mockSubscriberWrapper,
  };
  beforeEach(() => {
    mockSessionContext = {
      isMaxPinned: false,
      pinSubscriber: vi.fn(),
    } as unknown as SessionContextType;
    mockUseSessionContext.mockImplementation(() => mockSessionContext);
  });

  it('closes menu after clicking menu item', () => {
    render(<ParticipantListItemMenu {...defaultProps} />);
    const menuButton = screen.getByRole('button');
    act(() => menuButton.click());
    expect(screen.getByTestId('pin-menu-item')).toBeVisible();
    const pinButton = screen.getByText('Pin John Doe');
    act(() => pinButton.click());
    expect(screen.queryByTestId('pin-menu-item')).not.toBeInTheDocument();
  });

  it('can pin participant', () => {
    render(<ParticipantListItemMenu {...defaultProps} />);
    const menuButton = screen.getByRole('button');
    act(() => menuButton.click());
    const pinButton = screen.getByText('Pin John Doe');
    act(() => pinButton.click());
    expect(mockSessionContext.pinSubscriber).toHaveBeenCalledWith('subId');
  });

  it('can unpin participant', () => {
    render(
      <ParticipantListItemMenu
        {...{ ...defaultProps, subscriberWrapper: { ...mockSubscriberWrapper, isPinned: true } }}
      />
    );
    const menuButton = screen.getByRole('button');
    act(() => menuButton.click());
    const pinButton = screen.getByText('Unpin John Doe');
    act(() => pinButton.click());
    expect(mockSessionContext.pinSubscriber).toHaveBeenCalledWith('subId');
  });

  it('cannot pin participant if maximum number of tiles are pinned', () => {
    mockSessionContext = {
      isMaxPinned: true,
      pinSubscriber: vi.fn(),
    } as unknown as SessionContextType;
    mockUseSessionContext.mockImplementation(() => mockSessionContext);
    render(<ParticipantListItemMenu {...defaultProps} />);
    const menuButton = screen.getByRole('button');
    act(() => menuButton.click());
    const pinButton = screen.getByText(/You can't pin any more tiles/);
    act(() => pinButton.click());
    expect(mockSessionContext.pinSubscriber).not.toHaveBeenCalled();
  });

  it('can still unpin participant if maximum number of tiles are pinned', () => {
    mockSessionContext = {
      isMaxPinned: true,
      pinSubscriber: vi.fn(),
    } as unknown as SessionContextType;
    mockUseSessionContext.mockImplementation(() => mockSessionContext);
    render(
      <ParticipantListItemMenu
        {...{ ...defaultProps, subscriberWrapper: { ...mockSubscriberWrapper, isPinned: true } }}
      />
    );
    const menuButton = screen.getByRole('button');
    act(() => menuButton.click());
    const pinButton = screen.getByText('Unpin John Doe');
    act(() => pinButton.click());
    expect(mockSessionContext.pinSubscriber).toHaveBeenCalledWith('subId');
  });
});
