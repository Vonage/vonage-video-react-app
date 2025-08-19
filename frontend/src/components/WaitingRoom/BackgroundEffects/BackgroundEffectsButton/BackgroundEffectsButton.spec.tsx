import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BackgroundEffectsButton from './BackgroundEffectsButton';

const { mockHasMediaProcessorSupport } = vi.hoisted(() => {
  return {
    mockHasMediaProcessorSupport: vi.fn().mockReturnValue(true),
  };
});
vi.mock('@vonage/client-sdk-video', () => ({
  hasMediaProcessorSupport: mockHasMediaProcessorSupport,
}));

describe('BackgroundEffectsButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the button if media processor is supported', () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);
    render(<BackgroundEffectsButton onClick={mockOnClick} />);
    expect(screen.getByLabelText(/background effects/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not render the button if media processor is not supported', () => {
    mockHasMediaProcessorSupport.mockReturnValue(false);
    const { container } = render(<BackgroundEffectsButton onClick={mockOnClick} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls onClick when the button is clicked', async () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);
    render(<BackgroundEffectsButton onClick={mockOnClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalled();
  });
});
