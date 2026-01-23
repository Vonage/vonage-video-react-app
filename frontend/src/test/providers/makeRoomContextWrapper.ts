import composeProviders from '@common/helpers/composeProviders';
import makeAppConfigProviderWrapper from './makeAppConfigProviderWrapper';
import makeUserProviderWrapper from './makeUserProviderWrapper';
import makeBackgroundPublisherProviderWrapper from './makeBackgroundPublisherProviderWrapper';
import makeAudioOutputProviderWrapper from './makeAudioOutputProviderWrapper';
import makePreviewPublisherProviderWrapper from './makePreviewPublisherProviderWrapper';
import type { PublisherProviderWrapperOptions } from './makePublisherProviderWrapper';
import type { SessionProviderWrapperOptions } from './makeSessionProviderWrapper';
import type { UserProviderWrapperOptions } from './makeUserProviderWrapper';
import type { AppConfigProviderWrapperOptions } from './makeAppConfigProviderWrapper';

export type RoomContextWrapperOptions = {
  publisherContext?: PublisherProviderWrapperOptions['publisherContext'];
  sessionContext?: SessionProviderWrapperOptions['sessionOptions'];
  userOptions?: UserProviderWrapperOptions['userOptions'];
  appConfigOptions?: AppConfigProviderWrapperOptions;
};

/**
 * Creates wrapper for RoomContext which composes multiple providers.
 * This mirrors the structure of RoomContext component:
 * - AppConfig
 * - User
 * - BackgroundPublisher (which includes Publisher, Session)
 * - PreviewPublisher
 * - AudioOutput
 *
 * @param {object} _options - The wrapper options (reserved for future use).
 * @returns The composed RoomContext wrapper and all context getters.
 */
function makeRoomContextWrapper(_options: RoomContextWrapperOptions = {}) {
  const { AppConfigWrapper, ...appConfigContext } = makeAppConfigProviderWrapper();
  const { UserProviderWrapper, ...userContext } = makeUserProviderWrapper();
  const { BackgroundPublisherProviderWrapper, ...backgroundPublisherContext } =
    makeBackgroundPublisherProviderWrapper();
  const { PreviewPublisherProviderWrapper, ...previewPublisherContext } =
    makePreviewPublisherProviderWrapper();
  const { AudioOutputProviderWrapper, ...audioOutputContext } = makeAudioOutputProviderWrapper();

  const RoomProviderWrapper = composeProviders(
    AppConfigWrapper,
    UserProviderWrapper,
    BackgroundPublisherProviderWrapper,
    PreviewPublisherProviderWrapper,
    AudioOutputProviderWrapper
  );

  return {
    RoomProviderWrapper,
    ...appConfigContext,
    ...userContext,
    ...backgroundPublisherContext,
    ...previewPublisherContext,
    ...audioOutputContext,
  };
}

export default makeRoomContextWrapper;
