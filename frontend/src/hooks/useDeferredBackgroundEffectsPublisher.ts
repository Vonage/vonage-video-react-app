import { useEffect } from 'react';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import useBackgroundPublisherContext from './useBackgroundPublisherContext';
import usePreviewPublisherContext from './usePreviewPublisherContext';

/**
 * Acquires the camera for the background/effects preview lazily — only once the effects panel is
 * actually open (and the camera isn't blocked). Deferring this avoids the waiting room grabbing the
 * camera twice at entry (once for the live preview, once for effects): on Safari every getUserMedia
 * re-prompts, so the eager second grab double-prompted the user. Effects are hidden while the camera
 * is blocked, so this also never fires on a denied camera.
 *
 * This must be called from within the backgroundEffectsDialog$ provider (e.g. VideoContainer). It
 * deliberately does NOT live in useWaitingRoom: that hook runs in the waiting-room component body,
 * above the effects-dialog provider it renders, so it cannot read backgroundEffectsDialog$ there.
 */
const useDeferredBackgroundEffectsPublisher = () => {
  const isEffectsOpen = backgroundEffectsDialog$.use.select((state) => state.isOpen);
  const { initBackgroundLocalPublisher, publisher: backgroundPublisher } =
    useBackgroundPublisherContext();
  const { deniedDevices } = usePreviewPublisherContext();

  useEffect(() => {
    if (isEffectsOpen && !backgroundPublisher && !deniedDevices.camera) {
      initBackgroundLocalPublisher();
    }
  }, [isEffectsOpen, backgroundPublisher, deniedDevices.camera, initBackgroundLocalPublisher]);
};

export default useDeferredBackgroundEffectsPublisher;
