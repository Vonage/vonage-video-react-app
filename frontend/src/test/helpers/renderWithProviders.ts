import {
  render as renderBase,
  renderHook as renderHookBase,
  RenderResult,
} from '@testing-library/react';
import type { ComponentType, ReactElement, ReactNode } from 'react';
import {
  makeAppConfigProviderWrapper,
  AppConfigProviderWrapperOptions,
  makePublisherProviderWrapper,
  PublisherProviderWrapperOptions,
  makeSessionProviderWrapper,
  SessionProviderWrapperOptions,
  makeAudioOutputProviderWrapper,
  AudioOutputProviderWrapperOptions,
  makePreviewPublisherProviderWrapper,
  PreviewPublisherProviderWrapperOptions,
} from '@test/providers';
import composeProviders from '@utils/composeProviders';
import type { SessionContextType } from '@Context/SessionProvider/session';
import type { PublisherContextType } from '@Context/PublisherProvider/usePublisher/usePublisher';
import type { UserContextType } from '@Context/user';
import type { AppConfigApi } from '@Context/AppConfig/AppConfigContext';

type RenderWithPublisherResult = RenderResult & {
  sessionContext: { current: SessionContextType };
  publisherContext: { current: PublisherContextType };
  userContext: { current: UserContextType };
  appConfigContext: { current: AppConfigApi };
};

/**
 * Renders a component with AppConfigProvider
 */
export function renderWithAppConfig(ui: ReactElement, options?: AppConfigProviderWrapperOptions) {
  const { AppConfigWrapper } = makeAppConfigProviderWrapper(options);
  return renderBase(ui, { wrapper: AppConfigWrapper });
}

/**
 * Renders a component with PublisherProvider
 */
export function renderWithPublisher(
  ui: ReactElement,
  options?: PublisherProviderWrapperOptions
): RenderWithPublisherResult {
  const { PublisherProviderWrapper, ...contexts } = makePublisherProviderWrapper(options);
  const renderResult = renderBase(ui, { wrapper: PublisherProviderWrapper });

  return {
    ...renderResult,
    ...contexts,
  } as RenderWithPublisherResult;
}

/**
 * Renders a component with SessionProvider
 */
export function renderWithSession(ui: ReactElement, options?: SessionProviderWrapperOptions) {
  const { SessionProviderWrapper, ...contexts } = makeSessionProviderWrapper(options);
  return {
    ...contexts,
    ...renderBase(ui, { wrapper: SessionProviderWrapper }),
  };
}

/**
 * Renders a hook with AudioOutputProvider
 */
export function renderHookWithAudioOutput<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: AudioOutputProviderWrapperOptions
) {
  const { AudioOutputProviderWrapper, audioOutputContext } =
    makeAudioOutputProviderWrapper(options);
  return {
    audioOutputContext,
    ...renderHookBase(hook, { wrapper: AudioOutputProviderWrapper }),
  };
}

/**
 * Renders a hook with PreviewPublisherProvider
 */
export function renderHookWithPreviewPublisher<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: PreviewPublisherProviderWrapperOptions
) {
  const { PreviewPublisherProviderWrapper, previewPublisherContext } =
    makePreviewPublisherProviderWrapper(options);
  return {
    previewPublisherContext,
    ...renderHookBase(hook, { wrapper: PreviewPublisherProviderWrapper }),
  };
}

/**
 * Renders a component with composed AppConfig and AudioOutput providers
 */
export function renderWithAppConfigAndAudioOutput(
  ui: ReactElement,
  options?: {
    appConfigOptions?: AppConfigProviderWrapperOptions;
    audioOutputOptions?: AudioOutputProviderWrapperOptions['audioOutputOptions'];
  }
) {
  const { AppConfigWrapper, appConfigContext } = makeAppConfigProviderWrapper(
    options?.appConfigOptions
  );
  const { AudioOutputProviderWrapper, audioOutputContext } = makeAudioOutputProviderWrapper({
    audioOutputOptions: options?.audioOutputOptions,
  });

  const wrapper = composeProviders(
    AudioOutputProviderWrapper as ComponentType<{ children: ReactNode }>,
    AppConfigWrapper
  );

  return {
    appConfigContext,
    audioOutputContext,
    ...renderBase(ui, { wrapper }),
  };
}
