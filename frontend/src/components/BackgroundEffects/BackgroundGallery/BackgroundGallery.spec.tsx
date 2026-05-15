import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render as renderBase, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BackgroundGallery from './BackgroundGallery';
import enTranslations from '../../../locales/en.json';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import { ReactElement } from 'react';
import {
  setupWindowNavigatorMock,
  makeMediaStreamMock,
  makeMediaDeviceInfos,
} from '@web-test/fixtures';
import { mediaDevices$ } from '@core/stores';

const mockDevices = makeMediaDeviceInfos();

const customImages = [
  { id: 'custom1', dataUrl: 'data:image/png;base64,custom1' },
  { id: 'custom2', dataUrl: 'data:image/png;base64,custom2' },
];

const backgrounds = [
  {
    id: 'bg4',
    file: 'hogwarts.jpg',
    name: enTranslations['backgroundEffects.backgrounds.hogwarts'],
  },
  { id: 'bg5', file: 'library.jpg', name: enTranslations['backgroundEffects.backgrounds.library'] },
  {
    id: 'bg6',
    file: 'new-york.jpg',
    name: enTranslations['backgroundEffects.backgrounds.newYork'],
  },
  { id: 'bg7', file: 'plane.jpg', name: enTranslations['backgroundEffects.backgrounds.plane'] },
];

const mockDeleteImageFromStorage = vi.fn();
const mockGetImagesFromStorage = vi.fn(() => customImages);
const mockDeleteCustomImage = vi.fn();
const mockHandleBackgroundChange = vi.fn();

vi.mock('@utils/useImageStorage/useImageStorage', () => ({
  __esModule: true,
  default: () => ({
    getImagesFromStorage: mockGetImagesFromStorage,
    deleteImageFromStorage: mockDeleteImageFromStorage,
  }),
}));

describe('BackgroundGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(mockDevices),
        getUserMedia: Promise.resolve(
          makeMediaStreamMock({
            getVideoTracks: [],
            getAudioTracks: [],
          })
        ),
      },
    });

    // Initialize the mediaDevices$ store with mock devices to prevent useSyncPublisherDevices from disabling video/audio
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: mockDevices,
    }));

    const { permissions } = globalThis.navigator;

    vi.spyOn(permissions, 'query').mockResolvedValue({ state: 'granted' } as PermissionStatus);
  });

  it('renders all built-in backgrounds as selectable options', async () => {
    render(<BackgroundGallery />);
    await waitFor(() => {
      backgrounds.forEach((bg) => {
        expect(screen.getByTestId(`background-${bg.id}`)).toBeInTheDocument();
      });
    });
  });

  it('renders custom images as selectable options', async () => {
    render(<BackgroundGallery />);
    await waitFor(() => {
      customImages.forEach((img) => {
        expect(screen.getByTestId(`background-${img.id}`)).toBeInTheDocument();
      });
    });
  });

  it('sets the selected built-in background', async () => {
    render(<BackgroundGallery />, {
      backgroundPublisherContext: {
        __interceptor: (context) => {
          context.handleBackgroundChange = mockHandleBackgroundChange;
        },
      },
    });
    const duneViewOption = screen.getByTestId('background-bg3');
    await userEvent.click(duneViewOption);
    expect(mockHandleBackgroundChange).toHaveBeenCalledWith('dune-view.jpg');
  });

  it('sets the selected custom image', async () => {
    render(<BackgroundGallery />, {
      backgroundPublisherContext: {
        __interceptor: (context) => {
          context.handleBackgroundChange = mockHandleBackgroundChange;
        },
      },
    });
    const customOption = screen.getByTestId('background-custom1');
    await userEvent.click(customOption);
    expect(mockHandleBackgroundChange).toHaveBeenCalledWith('data:image/png;base64,custom1');
  });

  it('marks the built-in background as selected', async () => {
    render(<BackgroundGallery />, {
      backgroundPublisherContext: {
        __onCreated: (context) => {
          context.backgroundSelected = 'plane.jpg';
        },
      },
    });
    const planeOption = screen.getByTestId('background-bg7');
    await waitFor(() => {
      expect(planeOption.getAttribute('aria-pressed')).toBe('true');
    });
  });

  it('marks the custom image as selected', async () => {
    render(<BackgroundGallery />, {
      backgroundPublisherContext: {
        __onCreated: (context) => {
          context.backgroundSelected = 'data:image/png;base64,custom2';
        },
      },
    });
    const customOption = screen.getByTestId('background-custom2');

    await waitFor(() => {
      expect(customOption.getAttribute('aria-pressed')).toBe('true');
    });
  });

  it('calls onDelete when deleting a custom image', async () => {
    render(<BackgroundGallery />, {
      backgroundPublisherContext: {
        __interceptor: (context) => {
          context.deleteCustomImage = mockDeleteCustomImage;
        },
      },
    });
    const deleteButtons = screen.getAllByLabelText('Delete custom background');
    await userEvent.click(deleteButtons[0]);
    expect(mockDeleteCustomImage).toHaveBeenCalledWith('custom1');
  });

  it("doesn't delete custom image if it's selected", async () => {
    render(<BackgroundGallery />, {
      backgroundPublisherContext: {
        __onCreated: (context) => {
          context.backgroundSelected = 'data:image/png;base64,custom1';
        },
      },
    });
    const deleteButton = screen.getByTestId('background-delete-custom1');
    await userEvent.click(deleteButton);
    expect(mockDeleteCustomImage).not.toHaveBeenCalled();
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
  publisherContext?: ProviderOptions['PublisherContext'];
  backgroundPublisherContext?: ProviderOptions['BackgroundPublisherContext'];
};

function render(
  ui: ReactElement,
  { userContext, sessionContext, publisherContext, backgroundPublisherContext }: RenderOptions = {}
) {
  const { wrapper, ...context } = makeTestProvider(
    [
      providers.user,
      providers.session,
      providers.publisher,
      providers.backgroundPublisher,
      providers.runtime,
    ],
    {
      userContext,
      sessionContext,
      publisherContext,
      backgroundPublisherContext,
      runtimeContext: undefined,
    }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
