import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import { MutableRefObject } from 'react';
import VideoOutputDevices from './VideoOutputDevices';
import { allMediaDevices } from '../../../utils/mockData/device';
import { AllMediaDevices } from '../../../types';
import useDevices from '../../../hooks/useDevices';

vi.mock('@vonage/client-sdk-video');
vi.mock('../../../hooks/useDevices.tsx');
const mockUseDevices = useDevices as Mock<
  [],
  { allMediaDevices: AllMediaDevices; getAllMediaDevices: () => void }
>;

const mockHandleToggle = vi.fn();
const mockHandleClose = vi.fn();
const mockSetIsOpen = vi.fn();
const mockAnchorRef = {
  current: document.createElement('input'),
} as MutableRefObject<HTMLInputElement>;

describe('VideoOutputDevices', () => {
  const mockedHasMediaProcessorSupport = vi.fn();
  beforeEach(() => {
    vi.resetAllMocks();
    mockUseDevices.mockReturnValue({
      getAllMediaDevices: vi.fn(),
      allMediaDevices,
    });
    (hasMediaProcessorSupport as Mock).mockImplementation(mockedHasMediaProcessorSupport);
    mockedHasMediaProcessorSupport.mockReturnValue(false);
  });

  it('renders if opened', () => {
    render(
      <VideoOutputDevices
        handleToggle={mockHandleToggle}
        handleClose={mockHandleClose}
        isOpen
        anchorRef={mockAnchorRef}
        setIsOpen={mockSetIsOpen}
      />
    );
    expect(screen.queryByTestId('video-output-devices-dropdown')).toBeInTheDocument();
  });

  it('does not render if closed', () => {
    render(
      <VideoOutputDevices
        handleToggle={mockHandleToggle}
        handleClose={mockHandleClose}
        isOpen={false}
        anchorRef={mockAnchorRef}
        setIsOpen={mockSetIsOpen}
      />
    );
    expect(screen.queryByTestId('video-output-devices-dropdown')).not.toBeInTheDocument();
  });

  it('renders the dropdown separator and background blur option when media processor is supported', () => {
    mockedHasMediaProcessorSupport.mockReturnValue(true);
    render(
      <VideoOutputDevices
        handleToggle={mockHandleToggle}
        handleClose={mockHandleClose}
        isOpen
        anchorRef={mockAnchorRef}
        setIsOpen={mockSetIsOpen}
      />
    );
    expect(screen.queryByTestId('dropdown-separator')).toBeVisible();
    expect(screen.queryByText('Blur your background')).toBeVisible();
  });

  it('does not render the dropdown separator and background blur option when media processor is not supported', () => {
    render(
      <VideoOutputDevices
        handleToggle={mockHandleToggle}
        handleClose={mockHandleClose}
        isOpen
        anchorRef={mockAnchorRef}
        setIsOpen={mockSetIsOpen}
      />
    );
    expect(screen.queryByTestId('dropdown-separator')).not.toBeInTheDocument();
    expect(screen.queryByText('Blur your background')).not.toBeInTheDocument();
  });
});
