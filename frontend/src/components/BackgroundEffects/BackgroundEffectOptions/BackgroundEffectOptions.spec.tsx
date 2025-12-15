import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import BackgroundEffectOptions from './BackgroundEffectOptions';
import useBackgroundPublisherContext from '@hooks/useBackgroundPublisherContext';

vi.mock('@hooks/useBackgroundPublisherContext');

describe('BackgroundEffectOptions', () => {
  const mockBackgroundPublisherContext = {
    backgroundSelected: '',
    setBackgroundSelected: vi.fn(),
    customImages: [],
    addCustomImage: vi.fn(),
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
    handleBackgroundChange: vi.fn(),
    handleAddCustomImage: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useBackgroundPublisherContext).mockReturnValue(mockBackgroundPublisherContext);
  });

  it('renders background options grid with effects and gallery', () => {
    render(<BackgroundEffectOptions mode="meeting" />);

    expect(screen.getByTestId('vivid-icon-remove-line')).toBeInTheDocument();
    expect(screen.getByTestId('vivid-icon-blur-line')).toBeInTheDocument();

    expect(screen.getByAltText('Bookshelf Room')).toBeInTheDocument();
    expect(screen.getByAltText('Busy Room')).toBeInTheDocument();
  });
});
