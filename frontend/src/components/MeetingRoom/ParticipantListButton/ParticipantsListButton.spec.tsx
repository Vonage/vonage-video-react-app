import { render as renderBase, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReactElement } from 'react';
import { makeTestProvider } from '@test/providers';
import ParticipantListButton from './ParticipantListButton';
import { env } from '../../../env';
import { raiseHand$ } from '@core/stores';

describe('ParticipantListButton', () => {
  it('should show participant number', () => {
    render(<ParticipantListButton handleClick={() => {}} isOpen={false} participantCount={10} />);
    expect(screen.getByText('10')).toBeVisible();
  });

  it('should invoke callback on click', () => {
    const handleClick = vi.fn();
    render(<ParticipantListButton handleClick={handleClick} isOpen participantCount={10} />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });
  it('shows the raised hand count when hands are raised', () => {
    env.partialUpdate({ ALLOW_RAISE_HAND: true });
    raiseHand$.actions.raiseHand({ connectionId: 'a' });
    raiseHand$.actions.raiseHand({ connectionId: 'b' });

    render(<ParticipantListButton handleClick={() => {}} isOpen={false} participantCount={10} />);

    expect(screen.getByTestId('participant-list-raised-hand-badge')).toHaveTextContent('2');

    raiseHand$.actions.lowerAllHands();
  });

  it('is not rendered when showParticipantList is false', () => {
    env.partialUpdate({
      SHOW_PARTICIPANT_LIST: false,
    });

    render(<ParticipantListButton handleClick={() => {}} isOpen={false} participantCount={10} />);

    expect(screen.queryByTestId('participant-list-button')).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([]);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
