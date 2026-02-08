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
  appConfigOptions?: AppConfigProviderWrapperOptions['appConfigOptions'];
  previewPublisherOptions?: PreviewPublisherProviderWrapperOptions['previewPublisherOptions'];
  audioOutputOptions?: AudioOutputProviderWrapperOptions['audioOutputOptions'];
  AppConfigWrapper?: PreviewPublisherProviderWrapperOptions['AppConfigWrapper'];
  UserProviderWrapper?: PreviewPublisherProviderWrapperOptions['UserProviderWrapper'];
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
 * @param {FC} [options.AppConfigWrapper] - Pre-made AppConfigWrapper to avoid re-creating it.
 * @param {FC} [options.UserProviderWrapper] - Pre-made UserProviderWrapper to avoid re-creating it.
 * @returns The composed RoomContext wrapper and all context getters.
 */
function makeRoomContextWrapper({
  appConfigOptions,
  userOptions,
  previewPublisherOptions,
  audioOutputOptions,
  ...options
}: RoomContextWrapperOptions = {}) {
  const { AppConfigWrapper, ...appConfigProvider } = options.AppConfigWrapper
    ? {
        AppConfigWrapper: options.AppConfigWrapper,
        BaseAppConfigWrapper: options.AppConfigWrapper,
        appConfigContext: { current: null! },
      }
    : makeAppConfigProviderWrapper({ appConfigOptions });

  const { UserProviderWrapper, ...userProvider } = options.UserProviderWrapper
    ? {
        UserProviderWrapper: options.UserProviderWrapper,
        BaseUserProviderWrapper: options.UserProviderWrapper,
        userContext: { current: null! },
      }
    : makeUserProviderWrapper({ userOptions });

  const { BackgroundPublisherProviderWrapper, ...backgroundPublisherProvider } =
    makeBackgroundPublisherProviderWrapper({
      AppConfigWrapper,
      UserProviderWrapper,
    });

  const { PreviewPublisherProviderWrapper, ...previewPublisherProvider } =
    makePreviewPublisherProviderWrapper({
      previewPublisherOptions,
      AppConfigWrapper,
      UserProviderWrapper,
    });

  const { AudioOutputProviderWrapper, ...audioOutputProvider } = makeAudioOutputProviderWrapper({
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
    ...appConfigProvider,
    ...userProvider,
    ...backgroundPublisherProvider,
    ...previewPublisherProvider,
    ...audioOutputProvider,
    RoomProviderWrapper,
  };
}

export default makeRoomContextWrapper;
