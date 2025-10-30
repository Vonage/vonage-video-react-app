import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ReactElement } from 'react';
import { AppConfigProviderWrapperOptions, makeAppConfigProviderWrapper } from '@test/providers';
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

  it('is not rendered when background effects are not allowed', () => {
    render(<BackgroundEffectsButton onClick={mockOnClick} />, {
      appConfigOptions: {
        value: {
          videoSettings: {
            allowBackgroundEffects: false,
          },
        },
      },
    });
    expect(screen.queryByLabelText(/background effects/i)).not.toBeInTheDocument();
  });
});

function render(
  ui: ReactElement,
  options?: {
    appConfigOptions?: AppConfigProviderWrapperOptions;
  }
) {
  const { AppConfigWrapper } = makeAppConfigProviderWrapper(options?.appConfigOptions);

  return renderBase(ui, { ...options, wrapper: AppConfigWrapper });
}
