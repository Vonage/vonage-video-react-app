import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import { PreviewPublisherContextType } from '../../../Context/PreviewPublisherProvider';
import usePreviewPublisherContext from '../../../hooks/usePreviewPublisherContext';
import BlurButton from './BlurButton';

vi.mock('../../../hooks/usePreviewPublisherContext');
vi.mock('../../hooks/usePreviewPublisherContext.tsx');

vi.mock('@vonage/client-sdk-video', () => ({
  hasMediaProcessorSupport: vi.fn(),
}));
const mockHasMediaProcessorSupport = hasMediaProcessorSupport as Mock;

const mockUsePreviewPublisherContext = usePreviewPublisherContext as unknown as Mock<
  [],
  PreviewPublisherContextType
>;

const mockToggleBlur = vi.fn();
const fullMockPreviewPublisherContext: PreviewPublisherContextType = {
  toggleBlur: mockToggleBlur,
  hasBlur: false,
  isAudioEnabled: true,
  isPublishing: false,
  isVideoEnabled: true,
  publisher: null,
  destroyPublisher: vi.fn(),
  publisherVideoElement: undefined,
  toggleAudio: vi.fn(),
  toggleVideo: vi.fn(),
  localAudioSource: undefined,
  localVideoSource: undefined,
  accessStatus: 'allowed',
  changeAudioSource: vi.fn(),
  changeVideoSource: vi.fn(),
  initLocalPublisher: vi.fn(),
  speechLevel: 0,
};

describe('BlurButton component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render if media processor is not supported', () => {
    mockHasMediaProcessorSupport.mockReturnValue(false);
    mockUsePreviewPublisherContext.mockReturnValue({
      ...fullMockPreviewPublisherContext,
      hasBlur: false,
    });
    const { container } = render(<BlurButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders BlurIcon when blur is off', () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);
    mockUsePreviewPublisherContext.mockReturnValue({
      ...fullMockPreviewPublisherContext,
      hasBlur: false,
    });
    render(<BlurButton />);
    expect(screen.getByLabelText(/toggle background blur/i)).toBeInTheDocument();
    expect(screen.getByTestId('blurIcon')).toBeInTheDocument();
  });

  it('renders BlurOff icon when blur is on', () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);
    mockUsePreviewPublisherContext.mockReturnValue({
      ...fullMockPreviewPublisherContext,
      hasBlur: true,
    });
    render(<BlurButton />);
    expect(screen.getByLabelText(/toggle background blur/i)).toBeInTheDocument();
    expect(screen.getByTestId('BlurOffIcon')).toBeInTheDocument();
  });

  it('calls toggleBlur when button is clicked', async () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);
    mockUsePreviewPublisherContext.mockReturnValue({
      ...fullMockPreviewPublisherContext,
      hasBlur: false,
    });
    render(<BlurButton />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    await button.click();
    expect(mockToggleBlur).toHaveBeenCalled();
  });
});
