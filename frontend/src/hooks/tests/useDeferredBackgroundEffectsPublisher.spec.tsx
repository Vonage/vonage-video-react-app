import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PropsWithChildren } from 'react';
import useDeferredBackgroundEffectsPublisher from '../useDeferredBackgroundEffectsPublisher';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import useBackgroundPublisherContext from '../useBackgroundPublisherContext';
import usePreviewPublisherContext from '../usePreviewPublisherContext';

vi.mock('../useBackgroundPublisherContext', () => ({ default: vi.fn() }));
vi.mock('../usePreviewPublisherContext', () => ({ default: vi.fn() }));

const initBackgroundLocalPublisher = vi.fn();

type SetupOptions = { hasBackgroundPublisher?: boolean; cameraDenied?: boolean };

function setupContexts({
  hasBackgroundPublisher = false,
  cameraDenied = false,
}: SetupOptions = {}) {
  vi.mocked(useBackgroundPublisherContext).mockReturnValue({
    initBackgroundLocalPublisher,
    publisher: hasBackgroundPublisher ? {} : null,
  } as unknown as ReturnType<typeof useBackgroundPublisherContext>);

  vi.mocked(usePreviewPublisherContext).mockReturnValue({
    deniedDevices: { microphone: false, camera: cameraDenied },
  } as unknown as ReturnType<typeof usePreviewPublisherContext>);
}

function renderWithEffectsOpen(isOpen: boolean) {
  const wrapper = ({ children }: PropsWithChildren) => (
    <backgroundEffectsDialog$.Provider value={(state) => ({ ...state, isOpen })}>
      {children}
    </backgroundEffectsDialog$.Provider>
  );

  return renderHook(() => useDeferredBackgroundEffectsPublisher(), { wrapper });
}

describe('useDeferredBackgroundEffectsPublisher', () => {
  beforeEach(() => {
    initBackgroundLocalPublisher.mockReset();
    setupContexts();
  });

  it('acquires the effects publisher when the panel opens and the camera is available', () => {
    setupContexts();
    renderWithEffectsOpen(true);

    expect(initBackgroundLocalPublisher).toHaveBeenCalledTimes(1);
  });

  it('does not acquire the effects publisher while the panel is closed', () => {
    setupContexts();
    renderWithEffectsOpen(false);

    expect(initBackgroundLocalPublisher).not.toHaveBeenCalled();
  });

  it('does not acquire the effects publisher when the camera is blocked', () => {
    setupContexts({ cameraDenied: true });
    renderWithEffectsOpen(true);

    expect(initBackgroundLocalPublisher).not.toHaveBeenCalled();
  });

  it('does not re-acquire when an effects publisher already exists', () => {
    setupContexts({ hasBackgroundPublisher: true });
    renderWithEffectsOpen(true);

    expect(initBackgroundLocalPublisher).not.toHaveBeenCalled();
  });
});
