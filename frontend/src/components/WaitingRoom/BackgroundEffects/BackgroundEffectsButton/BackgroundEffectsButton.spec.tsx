import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReactElement } from 'react';
import { makeTestProvider } from '@test/providers';
import BackgroundEffectsButton from './BackgroundEffectsButton';
import { env } from '../../../../env';

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
    env.partialUpdate({
      ALLOW_BACKGROUND_EFFECTS: true,
    });
  });

  it('renders the button if media processor is supported', () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);
    render(<BackgroundEffectsButton onClick={mockOnClick} />);
    expect(screen.getByLabelText(/video effects/i)).toBeInTheDocument();
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

  it('is not rendered when background effects are not allowed', () => {
    env.partialUpdate({
      ALLOW_BACKGROUND_EFFECTS: false,
    });

    render(<BackgroundEffectsButton onClick={mockOnClick} />);

    expect(screen.queryByLabelText(/video effects/i)).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([]);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
