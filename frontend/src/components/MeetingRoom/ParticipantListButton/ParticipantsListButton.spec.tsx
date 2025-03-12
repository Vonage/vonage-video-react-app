import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import ParticipantListButton from './ParticipantListButton';
import useSessionContext from '../../../hooks/useSessionContext';
import { SessionContextType } from '../../../Context/SessionProvider/session';

vi.mock('../../../hooks/useSessionContext');
const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const sessionContext = {
  rightPanelActiveTab: 'closed',
} as unknown as SessionContextType;

describe('ParticipantListButton', () => {
  beforeEach(() => {
    mockUseSessionContext.mockReturnValue(sessionContext);
  });

  it('should show participant number', () => {
    render(<ParticipantListButton handleClick={() => {}} participantCount={10} />);
    expect(screen.getByText('10')).toBeVisible();
  });

  it('should have a white icon when the list is closed', () => {
    render(<ParticipantListButton handleClick={() => {}} participantCount={10} />);
    expect(screen.getByTestId('PeopleIcon')).toHaveStyle('color: rgb(255, 255, 255)');
  });

  describe('when the list is open', () => {
    const sessionContextOpen = {
      rightPanelActiveTab: 'participant-list',
    } as unknown as SessionContextType;

    beforeEach(() => {
      mockUseSessionContext.mockReturnValue(sessionContextOpen);
    });

    it('should have a blue icon', () => {
      render(<ParticipantListButton handleClick={() => {}} participantCount={10} />);
      expect(screen.getByTestId('PeopleIcon')).toHaveStyle('color: rgb(130, 177, 255)');
    });

    it('should invoke callback on click', () => {
      const handleClick = vi.fn();
      render(<ParticipantListButton handleClick={handleClick} participantCount={10} />);
      screen.getByRole('button').click();
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
