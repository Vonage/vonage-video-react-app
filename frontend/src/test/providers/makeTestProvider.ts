import composeProviders, { type ProviderComponent } from '@web/helpers/composeProviders';
import {
  makeBackgroundPublisherProviderWrapper,
  makePreviewPublisherProviderWrapper,
  makePublisherProviderWrapper,
  makeSessionProviderWrapper,
  makeUserProviderWrapper,
} from './makersIndex';

/**
 * Keep updated accordingly to the providers you have and their dependencies.
 */
export enum providers {
  user = 'user',
  session = 'session',
  publisher = 'publisher',
  backgroundPublisher = 'backgroundPublisher',
  previewPublisher = 'previewPublisher',
}

/**
 * Keep updated accordingly to the providers you have and their dependencies.
 */
const MAKERS = {
  [providers.user]: makeUserProviderWrapper,
  [providers.session]: makeSessionProviderWrapper,
  [providers.publisher]: makePublisherProviderWrapper,
  [providers.backgroundPublisher]: makeBackgroundPublisherProviderWrapper,
  [providers.previewPublisher]: makePreviewPublisherProviderWrapper,
} as const;

type ProvidersMakers = typeof MAKERS;

/**
 * Keep updated accordingly to the providers you have and their dependencies.
 */
const PROVIDER_DEPENDENCIES = {
  [providers.user]: [],
  [providers.session]: [providers.user],
  [providers.publisher]: [providers.user, providers.session],
  [providers.backgroundPublisher]: [providers.user, providers.session, providers.publisher],
  [providers.previewPublisher]: [providers.user],
} as const;

/**
 * Infer the possible parameters for the provided keys
 */
type ProviderOptionsFor<Keys extends readonly providers[]> = {
  [K in Keys[number] as `${K}Context`]: Parameters<ProvidersMakers[K]>[0] | undefined;
};

/**
 * Infer the context britches for the provided keys
 */
type ProviderContextsFor<Keys extends readonly providers[]> = {
  [K in Keys[number] as `${K}Context`]: NonNullable<ReturnType<ProvidersMakers[K]>['context']>;
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
   * Create the providers wrappers and contexts for the provided keys
   */
  const providers = keys.map((key) => {
    const maker = MAKERS[key];
    const makerOptions = options?.[`${key}Context` as keyof Options] ?? {};
    return maker(makerOptions);
  });

  const wrapper = composeProviders(...providers.map(({ wrapper }) => wrapper));

  return {
    wrapper,
    ...providers.reduce((acc, { context }, index) => {
      const key = keys[index];

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
  [K in providers as `${Capitalize<K>}Context`]?: Parameters<ProvidersMakers[K]>[0];
};

export default makeTestProvider;
