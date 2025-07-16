import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import { PreviewPublisherContextType } from '../../../Context/PreviewPublisherProvider';
import usePreviewPublisherContext from '../../../hooks/usePreviewPublisherContext';
import BlurButton from './BlurButton';

vi.mock('../../../hooks/usePreviewPublisherContext');

vi.mock('@vonage/client-sdk-video', () => ({
  hasMediaProcessorSupport: vi.fn(),
}));
const mockHasMediaProcessorSupport = hasMediaProcessorSupport as Mock;

const mockUsePreviewPublisherContext = usePreviewPublisherContext as unknown as Mock<
  [],
  PreviewPublisherContextType
>;

const mockToggleBlur = vi.fn();

describe('BlurButton component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePreviewPublisherContext.mockReturnValue({
      hasBlur: false,
      toggleBlur: mockToggleBlur,
    } as unknown as PreviewPublisherContextType);
  });

  it('does not render if media processor is not supported', () => {
    mockHasMediaProcessorSupport.mockReturnValue(false);
    const { container } = render(<BlurButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders BlurIcon when blur is off', () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);
    render(<BlurButton />);
    expect(screen.getByLabelText(/toggle background blur/i)).toBeInTheDocument();
    expect(screen.getByTestId('blurIcon')).toBeInTheDocument();
  });

  it('renders BlurOff icon when blur is on', () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);
    mockUsePreviewPublisherContext.mockReturnValue({
      hasBlur: true,
    } as unknown as PreviewPublisherContextType);
    render(<BlurButton />);
    expect(screen.getByLabelText(/toggle background blur/i)).toBeInTheDocument();
    expect(screen.getByTestId('BlurOffIcon')).toBeInTheDocument();
  });

  it('calls toggleBlur when button is clicked', async () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);
    render(<BlurButton />);
    const button = screen.getByTestId('video-container-button');
    expect(button).toBeInTheDocument();
    await button.click();
    expect(mockToggleBlur).toHaveBeenCalled();
  });
});
