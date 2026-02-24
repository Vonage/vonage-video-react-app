import { render as renderBase, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReactElement } from 'react';
import { makeTestProvider, providers } from '@test/providers';
import BackgroundEffectsLayout from './BackgroundEffectsLayout';
import enTranslations from '../../../locales/en.json';
import composeProviders from '@web/helpers/composeProviders';
import SuspenseBoundary from '@web/components/SuspenseBoundary/SuspenseBoundary';
import { setupWindowNavigatorMock, makeMediaStreamMock } from '@web-test/fixtures';

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

describe('BackgroundEffectsLayout (Meeting room)', () => {
  const handleClose = vi.fn();

  beforeEach(() => {
    handleClose.mockClear();
    applyBackgroundFilterMock.mockClear();

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        enumerateDevices: Promise.resolve([]),
        getUserMedia: Promise.resolve(
          makeMediaStreamMock({
            getTracks: vi.fn().mockReturnValue([]),
            getAudioTracks: vi.fn().mockReturnValue([]),
            getVideoTracks: vi.fn().mockReturnValue([]),
          })
        ),
      },
      permissions: {
        query: vi.fn().mockResolvedValue({ state: 'granted' } as PermissionStatus),
      },
    });
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

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        enumerateDevices: Promise.resolve([]),
        getUserMedia: Promise.resolve(
          makeMediaStreamMock({
            getVideoTracks: [],
            getAudioTracks: [],
          })
        ),
      },
      permissions: {
        query: vi.fn().mockResolvedValue({ state: 'granted' } as PermissionStatus),
      },
    });
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
  const { wrapper: roomWrapper, ...context } = makeTestProvider([
    providers.user,
    providers.session,
    providers.publisher,
    providers.backgroundPublisher,
    providers.previewPublisher,
  ]);

  const wrapper = composeProviders(SuspenseBoundary, roomWrapper);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
