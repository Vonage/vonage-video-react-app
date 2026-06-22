import composeProviders, { type ProviderComponent } from '@web/helpers/composeProviders';
import {
  makeBackgroundPublisherProviderWrapper,
  makePreviewPublisherProviderWrapper,
  makePublisherProviderWrapper,
  makeRuntimeProviderWrapper,
  makeSessionProviderWrapper,
  makeUserProviderWrapper,
  makeAdvancedSettingsProviderWrapper,
  type BackgroundPublisherProviderWrapperOptions,
  type PreviewPublisherProviderWrapperOptions,
  type PublisherProviderWrapperOptions,
  type RuntimeProviderWrapperOptions,
  type SessionProviderWrapperOptions,
  type UserProviderWrapperOptions,
  AdvancedSettingsProviderWrapperOptions,
} from './makersIndex';

/**
 * Keep updated accordingly to the providers you have and their dependencies.
 */
export enum providers {
  advancedSettings = 'advancedSettings',
  runtime = 'runtime',
  user = 'user',
  session = 'session',
  publisher = 'publisher',
  backgroundPublisher = 'backgroundPublisher',
  previewPublisher = 'previewPublisher',
}

type ProviderOptionsByKey = {
  [providers.advancedSettings]: AdvancedSettingsProviderWrapperOptions;
  [providers.runtime]: RuntimeProviderWrapperOptions;
  [providers.user]: UserProviderWrapperOptions;
  [providers.session]: SessionProviderWrapperOptions;
  [providers.publisher]: PublisherProviderWrapperOptions;
  [providers.backgroundPublisher]: BackgroundPublisherProviderWrapperOptions;
  [providers.previewPublisher]: PreviewPublisherProviderWrapperOptions;
};

type ProviderContextsByKey = {
  [providers.advancedSettings]: NonNullable<
    ReturnType<typeof makeAdvancedSettingsProviderWrapper>['context']
  >;
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
  [providers.advancedSettings]: [],
  [providers.runtime]: [],
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
  [K in Keys[number] as `${K}Context`]: ProviderOptionsByKey[K] | undefined;
};

/**
 * Infer the context britches for the provided keys
 */
type ProviderContextsFor<Keys extends readonly providers[]> = {
  [K in Keys[number] as `${K}Context`]: ProviderContextsByKey[K];
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
  const providerWrappers = sortedKeys.map((key) => {
    switch (key) {
      case providers.advancedSettings:
        return makeAdvancedSettingsProviderWrapper(
          (options as ProviderOptionsFor<[providers.advancedSettings]> | undefined)
            ?.advancedSettingsContext
        );
      case providers.runtime:
        return makeRuntimeProviderWrapper(
          (options as ProviderOptionsFor<[providers.runtime]> | undefined)?.runtimeContext
        );
      case providers.user:
        return makeUserProviderWrapper(
          (options as ProviderOptionsFor<[providers.user]> | undefined)?.userContext
        );
      case providers.session:
        return makeSessionProviderWrapper(
          (options as ProviderOptionsFor<[providers.session]> | undefined)?.sessionContext
        );
      case providers.publisher:
        return makePublisherProviderWrapper(
          (options as ProviderOptionsFor<[providers.publisher]> | undefined)?.publisherContext
        );
      case providers.backgroundPublisher:
        return makeBackgroundPublisherProviderWrapper(
          (options as ProviderOptionsFor<[providers.backgroundPublisher]> | undefined)
            ?.backgroundPublisherContext
        );
      case providers.previewPublisher:
        return makePreviewPublisherProviderWrapper(
          (options as ProviderOptionsFor<[providers.previewPublisher]> | undefined)
            ?.previewPublisherContext
        );
      default:
        throw new Error(`Unknown provider: ${key}`);
    }
  });

  const wrapper = composeProviders(...providerWrappers.map(({ wrapper }) => wrapper));

  return {
    wrapper,
    ...providerWrappers.reduce((acc, { context }, index) => {
      const key = sortedKeys[index];

      return {
        ...acc,
        [`${key}Context` as keyof ProviderContextsFor<Keys>]: context,
      };
    }, {} as ProviderContextsFor<Keys>),
  };
}

/**
 * All parameters
 */
export type ProviderOptions = {
  [K in providers as `${Capitalize<K>}Context`]?: ProviderOptionsByKey[K];
};

export default makeTestProvider;
