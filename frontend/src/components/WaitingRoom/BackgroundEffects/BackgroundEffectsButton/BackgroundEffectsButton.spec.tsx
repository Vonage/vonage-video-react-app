import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import BackgroundEffectsButton from './BackgroundEffectsButton';
import useConfigContext from '../../../../hooks/useConfigContext';
import { ConfigContextType } from '../../../../Context/ConfigProvider';

const { mockHasMediaProcessorSupport } = vi.hoisted(() => {
  return {
    mockHasMediaProcessorSupport: vi.fn().mockReturnValue(true),
  };
});
vi.mock('@vonage/client-sdk-video', () => ({
  hasMediaProcessorSupport: mockHasMediaProcessorSupport,
}));

vi.mock('../../../hooks/useConfigContext');
const mockUseConfigContext = useConfigContext as Mock<[], ConfigContextType>;

describe('BackgroundEffectsButton', () => {
  const mockOnClick = vi.fn();
  let mockConfigContext: ConfigContextType;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfigContext = {
      videoSettings: {
        allowBackgroundEffects: true,
      },
    } as unknown as ConfigContextType;
    mockUseConfigContext.mockReturnValue(mockConfigContext);
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

  it('is not rendered when background effects are not allowed', () => {
    mockConfigContext.videoSettings.allowBackgroundEffects = false;
    render(<BackgroundEffectsButton onClick={mockOnClick} />);
    expect(screen.queryByLabelText(/background effects/i)).not.toBeInTheDocument();
  });
});
