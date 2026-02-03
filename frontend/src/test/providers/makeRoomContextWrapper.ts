import composeProviders from '@common/helpers/composeProviders';
import makeAppConfigProviderWrapper from './makeAppConfigProviderWrapper';
import makeUserProviderWrapper from './makeUserProviderWrapper';
import makeBackgroundPublisherProviderWrapper from './makeBackgroundPublisherProviderWrapper';
import makeAudioOutputProviderWrapper, {
  AudioOutputProviderWrapperOptions,
} from './makeAudioOutputProviderWrapper';
import makePreviewPublisherProviderWrapper from './makePreviewPublisherProviderWrapper';
import type { UserProviderWrapperOptions } from './makeUserProviderWrapper';
import type { AppConfigProviderWrapperOptions } from './makeAppConfigProviderWrapper';
import type { PreviewPublisherProviderWrapperOptions } from './makePreviewPublisherProviderWrapper';

export type RoomContextWrapperOptions = {
  userOptions?: UserProviderWrapperOptions['userOptions'];
  appConfigOptions?: AppConfigProviderWrapperOptions;
  previewPublisherOptions?: PreviewPublisherProviderWrapperOptions['previewPublisherOptions'];
  audioOutputOptions?: AudioOutputProviderWrapperOptions['audioOutputOptions'];
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
 * @param {object} options - The wrapper options.
 * @param {AppConfigProviderWrapperOptions} [options.appConfigOptions] - Options for the AppConfigProvider wrapper.
 * @param {UserProviderWrapperOptions} [options.userOptions] - Options for the UserProvider wrapper.
 * @param {PreviewPublisherProviderWrapperOptions} [options.previewPublisherOptions] - Options for the PreviewPublisherProvider wrapper.
 * @param {AudioOutputProviderWrapperOptions} [options.audioOutputOptions] - Options for the AudioOutputProvider wrapper.
 * @param {PublisherProviderWrapperOptions} [options.publisherOptions] - Options for the PublisherProvider wrapper.
 * @param {SessionProviderWrapperOptions} [options.sessionOptions] - Options for the SessionProvider wrapper.
 * @returns The composed RoomContext wrapper and all context getters.
 */
function makeRoomContextWrapper({
  appConfigOptions,
  userOptions,
  previewPublisherOptions,
  audioOutputOptions,
}: RoomContextWrapperOptions = {}) {
  const { AppConfigWrapper, ...appConfigContext } = makeAppConfigProviderWrapper(appConfigOptions);

  const { UserProviderWrapper, ...userContext } = makeUserProviderWrapper({
    userOptions,
  });

  const { BackgroundPublisherProviderWrapper, ...backgroundPublisherContext } =
    makeBackgroundPublisherProviderWrapper();

  const { PreviewPublisherProviderWrapper, ...previewPublisherContext } =
    makePreviewPublisherProviderWrapper({
      previewPublisherOptions,
      AppConfigWrapper,
    });

  const { AudioOutputProviderWrapper, ...audioOutputContext } = makeAudioOutputProviderWrapper({
    audioOutputOptions,
  });

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
