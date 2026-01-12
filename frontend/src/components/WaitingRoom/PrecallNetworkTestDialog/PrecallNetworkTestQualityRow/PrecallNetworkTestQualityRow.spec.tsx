import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrecallNetworkTestQualityRow from './PrecallNetworkTestQualityRow';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('PrecallNetworkTestQualityRow', () => {
  it('renders the provided label and quality label text', () => {
    render(
      <PrecallNetworkTestQualityRow label="Audio" score={3.5} supportTitle="Audio supported" />
    );

    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('waitingRoom.precallNetworkTest.qualityLabel')).toBeInTheDocument();
  });

  it('formats and displays the score with two decimals and /5', () => {
    render(<PrecallNetworkTestQualityRow label="Audio" score={3.14159} />);

    expect(screen.getByText('3.14/5')).toBeInTheDocument();
  });

  it('shows a check icon when score is >= 3', () => {
    render(<PrecallNetworkTestQualityRow label="Video" score={3} />);

    expect(screen.getByTestId('vivid-icon-check-circle-line')).toBeInTheDocument();
    expect(screen.queryByTestId('vivid-icon-close-circle-line')).not.toBeInTheDocument();
  });

  it('shows a close icon when score is below 3', () => {
    render(<PrecallNetworkTestQualityRow label="Video" score={2.99} />);

    expect(screen.getByTestId('vivid-icon-close-circle-line')).toBeInTheDocument();
    expect(screen.queryByTestId('vivid-icon-check-circle-line')).not.toBeInTheDocument();
    expect(screen.getByText('2.99/5')).toBeInTheDocument();
  });

  it('applies the supportTitle as a title attribute on the row', () => {
    render(<PrecallNetworkTestQualityRow label="Audio" score={4} supportTitle="Audio supported" />);

    expect(screen.getByTitle('Audio supported')).toBeInTheDocument();
  });
});
