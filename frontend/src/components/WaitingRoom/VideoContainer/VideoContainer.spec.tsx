import { act, renderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi, type Mock } from 'vitest';
import { ReactElement } from 'react';
import advancedSettings$ from '@Context/AdvancedSettings';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import composeProviders from '@web/helpers/composeProviders';
import SuspenseBoundary from '@web/components/SuspenseBoundary';
import renderAsyncComponent from '@web-test/renderAsyncComponent';
import { makeTestProvider, providers } from '@test/providers';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import type { PreviewPublisherContextType } from '@Context/PreviewPublisherProvider';
import VideoContainer from './VideoContainer';

vi.mock('@hooks/usePreviewPublisherContext');

const mockUsePreviewPublisherContext = usePreviewPublisherContext as Mock<
  [],
  PreviewPublisherContextType
>;

describe('VideoContainer', () => {
  it('renders the advanced settings dialog behind a lazy-load boundary when opened', async () => {
    mockUsePreviewPublisherContext.mockReturnValue({
      isVideoLoading: false,
      isVideoEnabled: false,
      isAudioEnabled: false,
      speechLevel: 0,
      publisherVideoElement: undefined,
    } as PreviewPublisherContextType);

    await render(<VideoContainer username="Test User" />);

    const { result } = renderHook(() => advancedSettings$.use());

    try {
      act(() => {
        result.current[1].open();
      });

      expect(
        await screen.findByTestId('advanced-settings-dialog', {}, { timeout: 5000 })
      ).toBeInTheDocument();
    } finally {
      act(() => {
        result.current[1].close();
      });
    }
  });
});

async function render(ui: ReactElement) {
  const { wrapper: MainWrapper } = makeTestProvider([providers.user, providers.runtime], {
    userContext: undefined,
    runtimeContext: undefined,
  });

  const wrapper = composeProviders(
    SuspenseBoundary,
    MainWrapper,
    backgroundEffectsDialog$.Provider,
    precallNetworkTestDialog$.Provider
  );

  return renderAsyncComponent(ui, { wrapper });
}
