import { render as renderBase, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReactElement } from 'react';
import { makeRoomContextWrapper } from '@test/providers';
import BackgroundEffectsLayout from './BackgroundEffectsLayout';
import enTranslations from '../../../locales/en.json';
import mediaDevicesMock from '@common/test/mocks/mediaDevicesMock';

const applyBackgroundFilterMock = vi.fn(() => Promise.resolve());

vi.mock('../../../utils/backgroundFilter/applyBackgroundFilter/applyBackgroundFilter', () => ({
  default: () => applyBackgroundFilterMock(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'backgroundEffects.title': enTranslations['backgroundEffects.title'],
        'button.cancel': enTranslations['button.cancel'],
        'button.apply': enTranslations['button.apply'],
      };
      return translations[key] || key;
    },
  }),
}));

mediaDevicesMock.addEventListener = vi.fn();
mediaDevicesMock.removeEventListener = vi.fn();
mediaDevicesMock.enumerateDevices = vi.fn(() => Promise.resolve([]));
mediaDevicesMock.getUserMedia = vi.fn(() =>
  Promise.resolve({
    getTracks: () => [],
    getAudioTracks: () => [],
    getVideoTracks: () => [],
  } as unknown as MediaStream)
);

Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: mediaDevicesMock,
});

Object.defineProperty(global.navigator, 'permissions', {
  writable: true,
  value: {
    query: vi.fn(() => Promise.resolve({ state: 'granted' })),
  },
});

describe('BackgroundEffectsLayout (Meeting room)', () => {
  const handleClose = vi.fn();

  beforeEach(() => {
    handleClose.mockClear();
    applyBackgroundFilterMock.mockClear();
  });

  it('renders when open', async () => {
    render(<BackgroundEffectsLayout mode="meeting" isOpen handleClose={handleClose} />);
    await waitFor(() => expect(screen.getByTestId('right-panel-title')).toBeInTheDocument());
    expect(screen.getByTestId('right-panel-title')).toHaveTextContent('Video effects');
    expect(screen.getByTestId('background-video-container')).toBeInTheDocument();
    expect(screen.getByTestId('background-none')).toBeInTheDocument();
    expect(screen.getByTestId('background-bg1')).toBeInTheDocument();
    expect(screen.getByTestId('background-effect-cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('background-effect-apply-button')).toBeInTheDocument();
  });

  it('does not render when closed', async () => {
    const { container } = render(
      <BackgroundEffectsLayout mode="meeting" isOpen={false} handleClose={handleClose} />
    );
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('calls handleClose when Cancel is clicked', async () => {
    render(<BackgroundEffectsLayout mode="meeting" isOpen handleClose={handleClose} />);
    await userEvent.click(screen.getByTestId('background-effect-cancel-button'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls handleClose and changeBackground when Apply is clicked', async () => {
    render(<BackgroundEffectsLayout mode="meeting" isOpen handleClose={handleClose} />);
    await userEvent.click(screen.getByTestId('background-effect-apply-button'));
    expect(handleClose).toHaveBeenCalled();
    expect(applyBackgroundFilterMock).toHaveBeenCalled();
  });

  it('calls setBackgroundSelected when effect option none is clicked', async () => {
    render(<BackgroundEffectsLayout mode="meeting" isOpen handleClose={handleClose} />);
    await userEvent.click(screen.getByTestId('background-none'));
  });

  it('calls setBackgroundSelected when a background gallery option is clicked', async () => {
    render(<BackgroundEffectsLayout mode="meeting" isOpen handleClose={handleClose} />);
    await userEvent.click(screen.getByTestId('background-bg8'));
  });

  it('displays correct English title, subtitle, cancel, and apply actions', async () => {
    render(<BackgroundEffectsLayout mode="meeting" isOpen handleClose={handleClose} />);
    await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument());
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });
});

describe('BackgroundEffects (Waiting Room)', () => {
  const handleClose = vi.fn();

  beforeEach(() => {
    handleClose.mockClear();
    applyBackgroundFilterMock.mockClear();
  });

  it('renders when open', async () => {
    render(<BackgroundEffectsLayout mode="waiting" isOpen handleClose={handleClose} />);
    await waitFor(() =>
      expect(screen.getByTestId('background-video-container')).toBeInTheDocument()
    );
    expect(screen.getByTestId('background-none')).toBeInTheDocument();
    expect(screen.getByTestId('background-bg1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Apply/i })).toBeInTheDocument();
  });

  it('does not render when closed', async () => {
    const { container } = render(
      <BackgroundEffectsLayout mode="waiting" isOpen={false} handleClose={handleClose} />
    );
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('calls handleClose when Cancel is clicked', async () => {
    render(<BackgroundEffectsLayout mode="waiting" isOpen handleClose={handleClose} />);
    await userEvent.click(screen.getByTestId('background-effect-cancel-button'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls handleClose and changeBackground when Apply is clicked', async () => {
    render(<BackgroundEffectsLayout mode="waiting" isOpen handleClose={handleClose} />);
    await userEvent.click(screen.getByTestId('background-effect-apply-button'));
    expect(handleClose).toHaveBeenCalled();
    expect(applyBackgroundFilterMock).toHaveBeenCalled();
  });

  it('calls setBackgroundSelected when effect option none is clicked', async () => {
    render(<BackgroundEffectsLayout mode="waiting" isOpen handleClose={handleClose} />);
    await userEvent.click(screen.getByTestId('background-none'));
  });

  it('calls setBackgroundSelected when a background gallery option is clicked', async () => {
    render(<BackgroundEffectsLayout mode="waiting" isOpen handleClose={handleClose} />);
    await userEvent.click(screen.getByTestId('background-bg8'));
  });

  it('displays correct English title, subtitle, cancel, and apply actions', async () => {
    render(<BackgroundEffectsLayout mode="waiting" isOpen handleClose={handleClose} />);
    await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument());
    expect(screen.getByText('Apply')).toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const { RoomProviderWrapper } = makeRoomContextWrapper();
  return renderBase(ui, { wrapper: RoomProviderWrapper });
}
