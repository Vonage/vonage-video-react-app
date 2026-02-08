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
enum providers {
  AppConfig = 'appConfig',
  User = 'user',
  Session = 'session',
  Publisher = 'publisher',
  BackgroundPublisher = 'backgroundPublisher',
  PreviewPublisher = 'previewPublisher',
  AudioOutput = 'audioOutput',
}

/**
 * Keep updated accordingly to the providers you have and their dependencies.
 */
const MAKERS = {
  [providers.AppConfig]: makeAppConfigProviderWrapper,
  [providers.User]: makeUserProviderWrapper,
  [providers.Session]: makeSessionProviderWrapper,
  [providers.Publisher]: makePublisherProviderWrapper,
  [providers.BackgroundPublisher]: makeBackgroundPublisherProviderWrapper,
  [providers.PreviewPublisher]: makePreviewPublisherProviderWrapper,
  [providers.AudioOutput]: makeAudioOutputProviderWrapper,
} as const;

type ProvidersMakers = typeof MAKERS;

/**
 * Keep updated accordingly to the providers you have and their dependencies.
 */
const PROVIDER_DEPENDENCIES = {
  [providers.AppConfig]: [],
  [providers.User]: [],
  [providers.Session]: [providers.AppConfig, providers.User],
  [providers.Publisher]: [providers.AppConfig, providers.User, providers.Session],
  [providers.BackgroundPublisher]: [
    providers.AppConfig,
    providers.User,
    providers.Session,
    providers.Publisher,
  ],
  [providers.PreviewPublisher]: [providers.AppConfig, providers.User],
  [providers.AudioOutput]: [],
} as const;

type ExtractFirstParamType<F extends AnyFunction> = F extends (arg: infer A, ...rest: Any[]) => Any
  ? A
  : never;

type ExtractedOptionsType<A> =
  NonNullable<A> extends Record<`${string}Options`, Any>
    ? NonNullable<A>[Extract<keyof NonNullable<A>, `${string}Options`>]
    : undefined;

/**
 * Infer the possible parameters for the provided keys
 */
type ProviderOptionsFor<Keys extends readonly providers[]> = Partial<{
  [K in Keys[number] as `${K}Options`]: ExtractedOptionsType<
    ExtractFirstParamType<ProvidersMakers[K]>
  >;
}>;

/**
 * Infer the context britches for the provided keys
 */
type ProviderContextsFor<Keys extends readonly providers[]> = {
  [K in Keys[number] as `${K}Context`]: ReturnType<ProvidersMakers[K]> extends Record<
    `${K}Context`,
    infer C
  >
    ? C
    : never;
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
        [`${key}Options`]: options?.[`${key}Options` as keyof Options],
      };

      return maker(makerOptions);
    });
  })();

  return null as Any;
}

export default makeTestProvider;
