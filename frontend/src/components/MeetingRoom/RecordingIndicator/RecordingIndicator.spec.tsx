import { render as renderBase, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { makeTestProvider } from '@test/providers';
import RecordingIndicator from './RecordingIndicator';

describe('RecordingIndicator', () => {
  it('renders the root indicator, pulse, and dot', () => {
    render(<RecordingIndicator />);

    expect(screen.getByTestId('recordingIndicator')).toBeInTheDocument();
    expect(screen.getByTestId('recordingIndicatorPulse')).toBeInTheDocument();
    expect(screen.getByTestId('recordingIndicatorDot')).toBeInTheDocument();
  });

  it('uses the compact size when requested', () => {
    render(<RecordingIndicator isCompact />);

    expect(screen.getByTestId('recordingIndicator')).toHaveClass('h-4', 'w-4');

    expect(screen.getByTestId('recordingIndicatorDot')).toHaveClass('inset-1');
  });
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([]);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
