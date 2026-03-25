import { describe, expect, it, vi, afterEach, beforeEach, Mock } from 'vitest';
import { fireEvent, render as renderBase, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { SessionContextType } from '@Context/SessionProvider/session';
import useSessionContext from '@hooks/useSessionContext';
import { makeTestProvider } from '@test/providers';
import { env } from '../../../env';
import SpatialAudioToggle from './SpatialAudioToggle';

vi.mock('@hooks/useSessionContext');

const { mockHasWebAudioSupport } = vi.hoisted(() => ({
  mockHasWebAudioSupport: vi.fn().mockReturnValue(true),
}));

vi.mock('@utils/hasWebAudioSupport', () => ({
  default: mockHasWebAudioSupport,
}));

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

describe('SpatialAudioToggle', () => {
  let mockToggleSpatialAudio: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockHasWebAudioSupport.mockReturnValue(true);
    env.partialUpdate({ ALLOW_SPATIAL_AUDIO: true });
    mockToggleSpatialAudio = vi.fn();
    mockUseSessionContext.mockReturnValue({
      isSpatialAudioEnabled: false,
      toggleSpatialAudio: mockToggleSpatialAudio,
    } as unknown as SessionContextType);
  });

  afterEach(() => {
    vi.clearAllMocks();
    env.partialUpdate({ ALLOW_SPATIAL_AUDIO: true });
  });

  it('renders the Spatial Audio label when the feature is enabled', () => {
    render(<SpatialAudioToggle />);
    expect(screen.getByText('Spatial Audio')).toBeInTheDocument();
  });

  it('renders both toggle icons in the DOM', () => {
    render(<SpatialAudioToggle />);
    expect(screen.getByTestId('spatial-audio-toggle-off')).toBeInTheDocument();
    expect(screen.getByTestId('spatial-audio-toggle-on')).toBeInTheDocument();
  });

  it('returns null when ALLOW_SPATIAL_AUDIO is false', () => {
    env.partialUpdate({ ALLOW_SPATIAL_AUDIO: false });
    const { container } = render(<SpatialAudioToggle />);
    expect(container).toBeEmptyDOMElement();
  });

  it('calls toggleSpatialAudio when the menu item is clicked in a supported browser', () => {
    render(<SpatialAudioToggle />);
    fireEvent.click(screen.getByRole('menuitemcheckbox'));
    expect(mockToggleSpatialAudio).toHaveBeenCalledTimes(1);
  });

  it('disables the toggle when the browser does not support Web Audio', () => {
    mockHasWebAudioSupport.mockReturnValue(false);
    render(<SpatialAudioToggle />);
    expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not call toggleSpatialAudio when the browser is unsupported', () => {
    mockHasWebAudioSupport.mockReturnValue(false);
    render(<SpatialAudioToggle />);
    fireEvent.click(screen.getByRole('menuitemcheckbox'));
    expect(mockToggleSpatialAudio).not.toHaveBeenCalled();
  });

  it('has aria-checked=false when spatial audio is disabled', () => {
    render(<SpatialAudioToggle />);
    expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('aria-checked', 'false');
  });

  it('has aria-checked=true when spatial audio is enabled', () => {
    mockUseSessionContext.mockReturnValue({
      isSpatialAudioEnabled: true,
      toggleSpatialAudio: mockToggleSpatialAudio,
    } as unknown as SessionContextType);
    render(<SpatialAudioToggle />);
    expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('aria-checked', 'true');
  });

  it('shows the unsupported tooltip when the browser does not support Web Audio', () => {
    mockHasWebAudioSupport.mockReturnValue(false);
    render(<SpatialAudioToggle />);
    // The Tooltip wraps the disabled toggle row; the title attribute is on the span wrapper
    expect(screen.getByRole('menuitemcheckbox').closest('span')).toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const { wrapper } = makeTestProvider([]);
  return renderBase(ui, { wrapper });
}
