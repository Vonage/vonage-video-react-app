import { render as renderBase, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReactElement } from 'react';
import { makeTestProvider } from '@test/providers';
import ParticipantListButton from './ParticipantListButton';

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
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([]);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
