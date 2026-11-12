import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeTestProvider } from '@test/providers';
import TranscriptionIndicator from './TranscriptionIndicator';

describe('TranscriptionIndicator', () => {
  const { wrapper } = makeTestProvider([]);

  function renderComponent(props = {}) {
    return render(<TranscriptionIndicator {...props} />, { wrapper });
  }

  it('renders the transcription indicator with text icon', () => {
    renderComponent();

    expect(screen.getByTestId('transcriptionIndicator')).toBeInTheDocument();
    expect(screen.getByTestId('transcriptionIndicatorIcon')).toBeInTheDocument();
  });

  it('uses the compact size when requested', () => {
    renderComponent({ isCompact: true });

    expect(screen.getByTestId('transcriptionIndicator')).toHaveClass('h-4', 'w-4');
  });
});
