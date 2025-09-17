import { render, screen } from '@testing-library/react';
import { describe, expect, it, Mock, vi, beforeEach } from 'vitest';
import ParticipantListButton from './ParticipantListButton';
import useConfigContext from '../../../hooks/useConfigContext';
import { ConfigContextType } from '../../../Context/ConfigProvider';

vi.mock('../../../hooks/useConfigContext');

const mockUseConfigContext = useConfigContext as Mock<[], ConfigContextType>;

describe('ParticipantListButton', () => {
  beforeEach(() => {
    mockUseConfigContext.mockReturnValue({
      meetingRoomSettings: {
        showParticipantListButton: true,
      },
    } as unknown as ConfigContextType);
  });

  it('should show participant number', () => {
    render(<ParticipantListButton handleClick={() => {}} isOpen={false} participantCount={10} />);
    expect(screen.getByText('10')).toBeVisible();
  });
  it('should have a white icon when the list is closed', () => {
    render(<ParticipantListButton handleClick={() => {}} isOpen={false} participantCount={10} />);
    expect(screen.getByTestId('PeopleIcon')).toHaveStyle('color: rgb(255, 255, 255)');
  });
  it('should have a blue icon when the list is open', () => {
    render(<ParticipantListButton handleClick={() => {}} isOpen participantCount={10} />);
    expect(screen.getByTestId('PeopleIcon')).toHaveStyle('color: rgb(130, 177, 255)');
  });
  it('should invoke callback on click', () => {
    const handleClick = vi.fn();
    render(<ParticipantListButton handleClick={handleClick} isOpen participantCount={10} />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });
  it('should not render if showParticipantListButton is false in config', () => {
    mockUseConfigContext.mockReturnValue({
      meetingRoomSettings: {
        showParticipantListButton: false,
      },
    } as unknown as ConfigContextType);
    render(<ParticipantListButton handleClick={() => {}} isOpen={false} participantCount={10} />);
    expect(screen.queryByTestId('participant-list-button')).not.toBeInTheDocument();
  });
});
