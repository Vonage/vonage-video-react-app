import composeProviders, { type ProviderComponent } from '@web/helpers/composeProviders';
import {
  makeAdvancedSettingsProviderWrapper,
  makeBackgroundPublisherProviderWrapper,
  makePreviewPublisherProviderWrapper,
  makePublisherProviderWrapper,
  makeRuntimeProviderWrapper,
  makeSessionProviderWrapper,
  makeUserProviderWrapper,
  type AdvancedSettingsProviderWrapperOptions,
  type BackgroundPublisherProviderWrapperOptions,
  type PublisherProviderWrapperOptions,
  type PreviewPublisherProviderWrapperOptions,
  type RuntimeProviderWrapperOptions,
  type SessionProviderWrapperOptions,
  type UserProviderWrapperOptions,
} from './makersIndex';

/**
 * Keep updated accordingly to the providers you have and their dependencies.
 */
export enum providers {
  runtime = 'runtime',
  advancedSettings = 'advancedSettings',
  user = 'user',
  session = 'session',
  publisher = 'publisher',
  backgroundPublisher = 'backgroundPublisher',
  previewPublisher = 'previewPublisher',
}

type ProviderOptionsByKey = {
  [providers.runtime]: RuntimeProviderWrapperOptions;
  [providers.advancedSettings]: AdvancedSettingsProviderWrapperOptions;
  [providers.user]: UserProviderWrapperOptions;
  [providers.session]: SessionProviderWrapperOptions;
  [providers.publisher]: PublisherProviderWrapperOptions;
  [providers.backgroundPublisher]: BackgroundPublisherProviderWrapperOptions;
  [providers.previewPublisher]: PreviewPublisherProviderWrapperOptions;
};

type ProviderContextsByKey = {
  [providers.runtime]: NonNullable<ReturnType<typeof makeRuntimeProviderWrapper>['context']>;
  [providers.user]: NonNullable<ReturnType<typeof makeUserProviderWrapper>['context']>;
  [providers.session]: NonNullable<ReturnType<typeof makeSessionProviderWrapper>['context']>;
  [providers.publisher]: NonNullable<ReturnType<typeof makePublisherProviderWrapper>['context']>;
  [providers.backgroundPublisher]: NonNullable<
    ReturnType<typeof makeBackgroundPublisherProviderWrapper>['context']
  >;
  [providers.previewPublisher]: NonNullable<
    ReturnType<typeof makePreviewPublisherProviderWrapper>['context']
  >;
};

/**
 * Keep updated accordingly to the providers you have and their dependencies.
 */
const PROVIDER_DEPENDENCIES = {
  [providers.runtime]: [],
  [providers.advancedSettings]: [],
  [providers.user]: [],
  [providers.session]: [providers.runtime, providers.user],
  [providers.publisher]: [providers.runtime, providers.user, providers.session],
  [providers.backgroundPublisher]: [
    providers.runtime,
    providers.user,
    providers.session,
    providers.publisher,
  ],
  [providers.previewPublisher]: [providers.user],
} as const;

/**
 * Infer the possible parameters for the provided keys
 */
type ProviderOptionsFor<Keys extends readonly providers[]> = {
  [K in Keys[number] as `${K}Context`]?: ProviderOptionsByKey[K] | undefined;
};

/**
 * Infer the context refs for the provided keys, excluding providers that have no context.
 */
type ProviderContextsFor<Keys extends readonly providers[]> = {
  [K in Keys[number] as K extends keyof ProviderContextsByKey
    ? `${K}Context`
    : never]: K extends keyof ProviderContextsByKey ? ProviderContextsByKey[K] : never;
};

type ProviderWrapperResult = {
  wrapper: ProviderComponent;
  context?: unknown;
};

function makeTestProvider<
  Keys extends readonly providers[],
  Options extends ProviderOptionsFor<Keys>,
>(
  keys: Keys,
  options?: Options
): {
  wrapper: ProviderComponent;
} & ProviderContextsFor<Keys> {
  /**
   * Check all the dependencies are included in the keys
   * Even if the maker knows it's dependencies, we need the keys to infer the correct type and to avoid duplicate providers
   */
  (() => {
    const necessaryKeys = new Set(
      keys.reduce((acc, key) => {
        return [...acc, ...PROVIDER_DEPENDENCIES[key], key];
      }, [] as providers[])
    );

    const isMissingDependency =
      necessaryKeys.size < keys.length || ![...necessaryKeys].every((key) => keys.includes(key));

    if (isMissingDependency) {
      throw new Error(
        `Some dependencies are missing for the provided keys. Provided keys: ${keys.join(
          ', '
        )}. Necessary keys: ${[...necessaryKeys].join(', ')}.`
      );
    }
  })();

  /**
   * Sort providers in topological dependency order so that parents are always
   * rendered as ancestors of the components that depend on them.
   * composeProviders(reduceRight) makes the first element the outermost wrapper.
   */
  const sortedKeys = (() => {
    const visited = new Set<providers>();
    const result: providers[] = [];

    const visit = (key: providers) => {
      if (visited.has(key)) return;

      visited.add(key);

      for (const dependency of PROVIDER_DEPENDENCIES[key]) {
        if ((keys as readonly providers[]).includes(dependency)) {
          visit(dependency);
        }
      }

      result.push(key);
    };

    for (const key of keys) {
      visit(key);
    }

    return result;
  })();

  /**
   * Create the providers wrappers and contexts for the provided keys
   */
  const providerWrappers: ProviderWrapperResult[] = [];

  for (const key of sortedKeys) {
    switch (key) {
      case providers.runtime: {
        const runtimeProviderWrapper = makeRuntimeProviderWrapper(
          (options as ProviderOptionsFor<[providers.runtime]> | undefined)?.runtimeContext
        );

        providerWrappers.push(runtimeProviderWrapper);
        break;
      }
      case providers.advancedSettings: {
        const advancedSettingsProviderWrapper = makeAdvancedSettingsProviderWrapper(
          (options as ProviderOptionsFor<[providers.advancedSettings]> | undefined)
            ?.advancedSettingsContext
        );

        providerWrappers.push(advancedSettingsProviderWrapper as ProviderWrapperResult);
        break;
      }
      case providers.user: {
        const userProviderWrapper = makeUserProviderWrapper(
          (options as ProviderOptionsFor<[providers.user]> | undefined)?.userContext
        );

        providerWrappers.push(userProviderWrapper);
        break;
      }
      case providers.session: {
        const sessionProviderWrapper = makeSessionProviderWrapper(
          (options as ProviderOptionsFor<[providers.session]> | undefined)?.sessionContext
        );

        providerWrappers.push(sessionProviderWrapper);
        break;
      }
      case providers.publisher: {
        const publisherProviderWrapper = makePublisherProviderWrapper(
          (options as ProviderOptionsFor<[providers.publisher]> | undefined)?.publisherContext
        );

        providerWrappers.push(publisherProviderWrapper);
        break;
      }
      case providers.backgroundPublisher: {
        const backgroundPublisherProviderWrapper = makeBackgroundPublisherProviderWrapper(
          (options as ProviderOptionsFor<[providers.backgroundPublisher]> | undefined)
            ?.backgroundPublisherContext
        );

        providerWrappers.push(backgroundPublisherProviderWrapper);
        break;
      }
      case providers.previewPublisher: {
        const previewPublisherProviderWrapper = makePreviewPublisherProviderWrapper(
          (options as ProviderOptionsFor<[providers.previewPublisher]> | undefined)
            ?.previewPublisherContext
        );

        providerWrappers.push(previewPublisherProviderWrapper);
        break;
      }
      default:
        throw new Error(`Unknown provider: ${key}`);
    }
  }

  const wrapper = composeProviders(
    ...providerWrappers.map(({ wrapper: providerWrapper }) => providerWrapper)
  );

  const contexts = providerWrappers.reduce<Record<string, unknown>>((acc, { context }, index) => {
    const key = sortedKeys[index];

    if (context === undefined) return acc;

    return {
      ...acc,
      [`${key}Context`]: context,
    };
  }, {});

  return {
    wrapper,
    ...(contexts as ProviderContextsFor<Keys>),
  };
}

/**
 * All parameters
 */
export type ProviderOptions = {
  [K in providers as `${Capitalize<K>}Context`]?: ProviderOptionsByKey[K];
};

export default makeTestProvider;
