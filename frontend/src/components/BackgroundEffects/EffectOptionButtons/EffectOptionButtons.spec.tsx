import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EffectOptionButtons from './EffectOptionButtons';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';

vi.mock('@hooks/useBackgroundPublisherContext');

describe('EffectOptionButtons', () => {
  const mockHandleBackgroundChange = vi.fn();
  const mockHandleAddCustomImage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBackgroundPublisherContext).mockReturnValue({
      backgroundSelected: 'none',
      handleBackgroundChange: mockHandleBackgroundChange,
      handleAddCustomImage: mockHandleAddCustomImage,
      customImages: [],
      deleteCustomImage: vi.fn(),
      isPublishing: false,
      isVideoEnabled: true,
      publisher: null,
      publisherVideoElement: undefined,
      destroyBackgroundPublisher: vi.fn(),
      toggleVideo: vi.fn(),
      changeBackground: vi.fn(),
      backgroundFilter: undefined,
      localVideoSource: undefined,
      accessStatus: null,
      changeVideoSource: vi.fn(),
      initBackgroundLocalPublisher: vi.fn(),
      addCustomImage: vi.fn(),
      setBackgroundSelected: vi.fn(),
    });
  });

  it('renders all effect options', () => {
    render(<EffectOptionButtons />);
    expect(screen.getByTestId('vivid-icon-remove-line')).toBeInTheDocument();
    expect(screen.getByTestId('vivid-icon-blur-line')).toBeInTheDocument();
    expect(screen.getByTestId('vivid-icon-blur-solid')).toBeInTheDocument();
  });

  it('marks the selected option as selected', () => {
    vi.mocked(useBackgroundPublisherContext).mockReturnValue({
      backgroundSelected: 'low-blur',
      handleBackgroundChange: mockHandleBackgroundChange,
      handleAddCustomImage: mockHandleAddCustomImage,
      customImages: [],
      deleteCustomImage: vi.fn(),
      isPublishing: false,
      isVideoEnabled: true,
      publisher: null,
      publisherVideoElement: undefined,
      destroyBackgroundPublisher: vi.fn(),
      toggleVideo: vi.fn(),
      changeBackground: vi.fn(),
      backgroundFilter: undefined,
      localVideoSource: undefined,
      accessStatus: null,
      changeVideoSource: vi.fn(),
      initBackgroundLocalPublisher: vi.fn(),
      addCustomImage: vi.fn(),
      setBackgroundSelected: vi.fn(),
    });
    render(<EffectOptionButtons />);
    const selectedOption = screen.getByTestId('background-low-blur');
    expect(selectedOption).toBeInTheDocument();
  });

  it('sets the selected background', async () => {
    render(<EffectOptionButtons />);
    const lowBlur = screen.getByTestId('background-low-blur');
    await userEvent.click(lowBlur);
    expect(mockHandleBackgroundChange).toHaveBeenCalledWith('low-blur');
  });

  it('sets the selected background with high blur', async () => {
    render(<EffectOptionButtons />);
    const highBlur = screen.getByTestId('background-high-blur');
    await userEvent.click(highBlur);
    expect(mockHandleBackgroundChange).toHaveBeenCalledWith('high-blur');
  });
});
