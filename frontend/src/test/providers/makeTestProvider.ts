import composeProviders from '@common/helpers/composeProviders';

import {
  makeAppConfigProviderWrapper,
  makeAudioOutputProviderWrapper,
  makeBackgroundPublisherProviderWrapper,
  makePreviewPublisherProviderWrapper,
  makePublisherProviderWrapper,
  makeSessionProviderWrapper,
  makeUserProviderWrapper,
} from './makersIndex';

import type { Any, AnyFunction } from 'react-global-state-hooks';

/**
 * Keep updated accordingly to the providers you have and their dependencies.
 */
export enum providers {
  appConfig = 'appConfig',
  user = 'user',
  session = 'session',
  publisher = 'publisher',
  backgroundPublisher = 'backgroundPublisher',
  previewPublisher = 'previewPublisher',
  audioOutput = 'audioOutput',
}

/**
 * Keep updated accordingly to the providers you have and their dependencies.
 */
const MAKERS = {
  [providers.appConfig]: makeAppConfigProviderWrapper,
  [providers.user]: makeUserProviderWrapper,
  [providers.session]: makeSessionProviderWrapper,
  [providers.publisher]: makePublisherProviderWrapper,
  [providers.backgroundPublisher]: makeBackgroundPublisherProviderWrapper,
  [providers.previewPublisher]: makePreviewPublisherProviderWrapper,
  [providers.audioOutput]: makeAudioOutputProviderWrapper,
} as const;

type ProvidersMakers = typeof MAKERS;

/**
 * Keep updated accordingly to the providers you have and their dependencies.
 */
const PROVIDER_DEPENDENCIES = {
  [providers.appConfig]: [],
  [providers.user]: [],
  [providers.session]: [providers.appConfig, providers.user],
  [providers.publisher]: [providers.appConfig, providers.user, providers.session],
  [providers.backgroundPublisher]: [
    providers.appConfig,
    providers.user,
    providers.session,
    providers.publisher,
  ],
  [providers.previewPublisher]: [providers.appConfig, providers.user],
  [providers.audioOutput]: [],
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
  wrapper: React.FC<React.PropsWithChildren>;
} & ProviderContextsFor<Keys> {
  /**
   * Check all the dependencies are included in the keys
   * Even if the maker knows it's dependencies, we need the keys to infer the correct type and to avoid duplicate providers
   */
  (() => {
    const necessaryKeys = new Set(
      keys.reduce((acc, key) => {
        return [...acc, ...PROVIDER_DEPENDENCIES[key]];
      }, [] as providers[])
    );

    const isMissingDependency =
      necessaryKeys.size !== keys.length || ![...necessaryKeys].every((key) => keys.includes(key));

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
  (() => {
    const providersWrappersAndContexts = keys.map((key) => {
      const maker = MAKERS[key];
      const makerOptions = {
        [`${key}Options`]: options?.[`${key}Context` as keyof Options],
      };

      return maker(makerOptions);
    });
  })();

  return null as Any;
}

/**
 * All parameters
 */
export type ProviderOptions = {
  [K in providers as `${Capitalize<K>}Context`]?: Parameters<ProvidersMakers[K]>[0];
};

export default makeTestProvider;
