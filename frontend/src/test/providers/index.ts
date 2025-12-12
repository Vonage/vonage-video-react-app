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
 * AudioOutputProvider, Done
 * BackgroundPublisherProvider, Done
 * PreviewPublisherProvider, Done
 * PublisherProvider, Done
 * RoomProvider
 *
 * Right now we are mocking all those context which downgrades the quality of our tests.
 */

export {
  default as makeAudioOutputProviderWrapper,
  type AudioOutputProviderWrapperOptions,
} from './makeAudioOutputProviderWrapper';

export {
  default as makePublisherProviderWrapper,
  type PublisherProviderWrapperOptions,
} from './makePublisherProviderWrapper';

export {
  default as makePreviewPublisherProviderWrapper,
  type PreviewPublisherProviderWrapperOptions,
} from './makePreviewPublisherProviderWrapper';

export {
  default as makeBackgroundPublisherProviderWrapper,
  type BackgroundPublisherProviderWrapperOptions,
} from './makeBackgroundPublisherProviderWrapper';

export {
  default as createTestProviderStack,
  type TestProviderStackOptions,
} from './createTestProviderStack';
