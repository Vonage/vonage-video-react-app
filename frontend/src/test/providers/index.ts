export {
  default as makeAppConfigProviderWrapper,
  type AppConfigProviderWrapperOptions,
} from './makeAppConfigProviderWrapper';

export {
  default as makeSessionProviderWrapper,
  type SessionProviderWrapperOptions,
} from './makeSessionProviderWrapper';

export {
  default as makeUserProviderWrapper,
  type UserProviderWrapperOptions,
} from './makeUserProviderWrapper';

/**
 * TODO: We still need to create provider wrappers for the following contexts:
 *
 * AudioOutputProvider,
 * BackgroundPublisherProvider,
 * PreviewPublisherProvider,
 * PublisherProvider,
 * RoomProvider
 *
 * Right now we are mocking all those context which downgrades the quality of our tests.
 */
