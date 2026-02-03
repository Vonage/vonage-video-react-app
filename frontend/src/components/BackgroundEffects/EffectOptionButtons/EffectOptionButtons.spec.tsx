import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render as renderBase, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import EffectOptionButtons from './EffectOptionButtons';
import {
  BackgroundPublisherProviderWrapperOptions,
  makeBackgroundPublisherProviderWrapper,
} from '@test/providers';
import mediaDevicesMock from '@common/test/mocks/mediaDevicesMock';

describe('EffectOptionButtons', () => {
  const mockHandleBackgroundChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: mediaDevicesMock,
    });

    vi.spyOn(mediaDevicesMock, 'addEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevicesMock, 'removeEventListener').mockImplementation(() => {});
    vi.spyOn(mediaDevicesMock, 'enumerateDevices').mockResolvedValue([]);
    vi.spyOn(mediaDevicesMock, 'getUserMedia').mockResolvedValue({
      getTracks: () => [],
      getAudioTracks: () => [],
      getVideoTracks: () => [],
    } as unknown as MediaStream);

    Object.defineProperty(global.navigator, 'permissions', {
      writable: true,
      value: {
        query: vi.fn().mockResolvedValue({ state: 'granted' }),
      },
    });
  });

  it('renders all effect options', async () => {
    render(<EffectOptionButtons />);
    await waitFor(() => {
      expect(screen.getByTestId('vivid-icon-remove-line')).toBeInTheDocument();
      expect(screen.getByTestId('vivid-icon-blur-line')).toBeInTheDocument();
      expect(screen.getByTestId('vivid-icon-blur-solid')).toBeInTheDocument();
    });
  });

  it('marks the selected option as selected', async () => {
    render(<EffectOptionButtons />, {
      backgroundPublisherOptions: {
        __onCreated: (context) => {
          context.backgroundSelected = 'low-blur';
        },
      },
    });
    await waitFor(() => {
      const selectedOption = screen.getByTestId('background-low-blur');
      expect(selectedOption).toBeInTheDocument();
    });
  });

  it('sets the selected background', async () => {
    render(<EffectOptionButtons />, {
      backgroundPublisherOptions: {
        __interceptor: (context) => {
          context.handleBackgroundChange = mockHandleBackgroundChange;
        },
      },
    });
    await waitFor(() => {
      expect(screen.getByTestId('background-low-blur')).toBeInTheDocument();
    });
    const lowBlur = screen.getByTestId('background-low-blur');
    await userEvent.click(lowBlur);
    await waitFor(() => {
      expect(mockHandleBackgroundChange).toHaveBeenCalledWith('low-blur');
    });
  });

  it('sets the selected background with high blur', async () => {
    render(<EffectOptionButtons />, {
      backgroundPublisherOptions: {
        __interceptor: (context) => {
          context.handleBackgroundChange = mockHandleBackgroundChange;
        },
      },
    });
    await waitFor(() => {
      expect(screen.getByTestId('background-high-blur')).toBeInTheDocument();
    });
    const highBlur = screen.getByTestId('background-high-blur');
    await userEvent.click(highBlur);
    await waitFor(() => {
      expect(mockHandleBackgroundChange).toHaveBeenCalledWith('high-blur');
    });
  });
});

type RenderOptions = {
  backgroundPublisherOptions?: BackgroundPublisherProviderWrapperOptions['backgroundPublisherOptions'];
};

function render(ui: ReactElement, options?: RenderOptions) {
  const { BackgroundPublisherProviderWrapper, ...backgroundProps } =
    makeBackgroundPublisherProviderWrapper({
      backgroundPublisherOptions: options?.backgroundPublisherOptions,
    });

  return {
    ...backgroundProps,
    ...renderBase(ui, { wrapper: BackgroundPublisherProviderWrapper }),
  };
}
