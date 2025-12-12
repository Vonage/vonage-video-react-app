import { ComponentType, ReactNode } from 'react';
import UserProvider, { UserType } from '@Context/user';
import { AudioOutputProvider } from '@Context/AudioOutputProvider';
import { PublisherProvider } from '@Context/PublisherProvider';
import { PreviewPublisherProvider } from '@Context/PreviewPublisherProvider';
import { BackgroundPublisherProvider } from '@Context/BackgroundPublisherProvider';
import SessionProvider from '@Context/SessionProvider/session';
import appConfig, { type AppConfig } from '@Context/AppConfig';
import { DeepPartial } from '@app-types/index';
import composeProviders from '@utils/composeProviders';
import defaultAppConfig from '@Context/AppConfig/helpers/defaultAppConfig';
import mergeAppConfigs from '@Context/AppConfig/helpers/mergeAppConfigs';
import { defaultUserFixture } from '../fixtures/userFixtures';

/**
 * Options for configuring the test provider stack.
 */
export type TestProviderStackOptions = {
  /**
   * User context initial state.
   * If not provided, uses defaultUserFixture.
   */
  user?: UserType;

  /**
   * App config context initial state.
   * If not provided, uses default config with isAppConfigLoaded: true.
   */
  appConfig?: DeepPartial<AppConfig>;

  /**
   * Include AudioOutputProvider in the stack.
   * @default true
   */
  includeAudioOutput?: boolean;

  /**
   * Include PublisherProvider in the stack.
   * @default true
   */
  includePublisher?: boolean;

  /**
   * Include PreviewPublisherProvider in the stack.
   * @default true
   */
  includePreviewPublisher?: boolean;

  /**
   * Include BackgroundPublisherProvider in the stack.
   * @default true
   */
  includeBackgroundPublisher?: boolean;

  /**
   * Include SessionProvider in the stack.
   * @default false
   */
  includeSession?: boolean;
};

/**
 * Creates a composed provider stack for testing components that depend on multiple contexts.
 *
 * This utility simplifies test setup by composing commonly used providers into a single
 * wrapper component. It ensures proper provider nesting and allows selective inclusion
 * of providers based on test requirements.
 *
 * @example
 * ```tsx
 * // Simple usage with defaults
 * const wrapper = createTestProviderStack();
 * renderHook(() => usePublisherContext(), { wrapper });
 * ```
 *
 * @example
 * ```tsx
 * // Custom user data and selective providers
 * const wrapper = createTestProviderStack({
 *   user: createUserFixture({ defaultSettings: { publishAudio: false } }),
 *   includeBackgroundPublisher: false,
 * });
 * ```
 *
 * @param options - Configuration options for the provider stack
 * @returns A composed provider component ready to use as a wrapper
 */
function createTestProviderStack(
  options: TestProviderStackOptions = {}
): ComponentType<{ children: ReactNode }> {
  const {
    user = defaultUserFixture,
    appConfig: appConfigOverrides,
    includeAudioOutput = true,
    includePublisher = true,
    includePreviewPublisher = true,
    includeBackgroundPublisher = true,
    includeSession = false,
  } = options;

  type ProviderComponent = ComponentType<{ children: ReactNode }>;
  const providers: ProviderComponent[] = [];

  // AppConfig provider (always included, prevents config.json fetch during tests)
  const appConfigValue = mergeAppConfigs({
    previous: defaultAppConfig,
    updates: {
      isAppConfigLoaded: true,
      ...appConfigOverrides,
    },
  });

  const AppConfigWrapper = appConfig.Provider.makeProviderWrapper({
    value: appConfigValue,
  }).wrapper;
  providers.push(AppConfigWrapper as ProviderComponent);

  // User provider (always included as it's a dependency for many other providers)
  const UserWrapper: ProviderComponent = ({ children }) => (
    <UserProvider value={user}>{children}</UserProvider>
  );
  providers.push(UserWrapper);

  // Optional providers based on configuration
  if (includeAudioOutput) {
    providers.push(AudioOutputProvider as ProviderComponent);
  }

  if (includeBackgroundPublisher) {
    providers.push(BackgroundPublisherProvider as ProviderComponent);
  }

  if (includePreviewPublisher) {
    providers.push(PreviewPublisherProvider as ProviderComponent);
  }

  if (includePublisher) {
    providers.push(PublisherProvider as ProviderComponent);
  }

  if (includeSession) {
    providers.push(SessionProvider as ProviderComponent);
  }

  // Compose all providers into a single component
  return composeProviders(...providers);
}

export default createTestProviderStack;
